#!/usr/bin/env node
import { GROUP_1M, GROUP_10M, getCapsByTier } from './config.js';
import { fetchUsageByModelUTC } from './usageClient.js';
import { aggregateByGroup } from './aggregate.js';
import { evaluateStatus } from './evaluate.js';
import { sendEmail } from './notify.js';
import { loadConfigFile, mergeConfig } from './configLoader.js';
import Table from 'cli-table3';


function parseArgs() {
  const args = {};
  const argvLocal = process.argv;
  for (let i = 2; i < argvLocal.length; i++) {
    const a = argvLocal[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argvLocal[i+1] && !argvLocal[i+1].startsWith('--') ? argvLocal[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function fmt(n) { return n.toLocaleString('en-US'); }
function fmtKMG(n) { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n); }

function printTable(rows) {
    const table = new Table({
      head: ['Group', 'Input', 'Output', 'Total', 'Cap', 'Usage%', 'Status'],
      colAligns: ['left', 'right', 'right', 'right', 'right', 'right', 'left']
    });
  
    for (const r of rows) {
      table.push([
        r.group,
        fmtKMG(r.input ?? 0),
        fmtKMG(r.output ?? 0),
        fmtKMG(r.total ?? 0),
        fmtKMG(r.cap ?? 0),
        r.usagePct,
        r.status
      ]);
    }
  
    console.log(table.toString());
  }

function printOneLine(rows) {
  const status = rows.map(r=>{ return r.group + ':' + fmtKMG(r.total) + '(' + r.usagePct + ')' + '[' + r.status + ']'; }).join(',');
  console.log(status);
}

async function main() {
  const args = parseArgs();
  const fileConf = loadConfigFile(args.config || process.env.CONFIG_PATH || './config.yml');
  const merged = mergeConfig(fileConf, args);

  const project = merged.project || args.project;
  const tier = Number(merged.tier || 1);
  const warn = Number(merged.warn ?? merged.thresholds?.warn ?? 80);
  const alert = Number(merged.alert ?? merged.thresholds?.alert ?? 95);
  const email = merged.email || (merged.notify?.email?.to ? merged.notify.email.to.join(',') : undefined) || args.email;
  const apiKey = process.env.OPENAI_ADMIN_KEY || merged.admin_key || args['admin-key'];
  const displayLevel = merged.display || 'normal';

  if (!project) { console.error('Missing --project <project_id>'); process.exit(1); }
  if (!apiKey) { console.error('Missing admin_key'); process.exit(1); }

  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0) / 1000;
  const end = Math.floor(Date.now() / 1000);

  const caps = getCapsByTier(tier);

  try {
    const byModel = await fetchUsageByModelUTC({ project, startTimeSec: start, endTimeSec: end, apiKey });
    const groups = aggregateByGroup(byModel);
    const { rows, exitCode } = evaluateStatus(groups, caps, { warn, alert });
    if (displayLevel === 'normal' || displayLevel === 'verbose') {
      printTable(rows);
    } else if (displayLevel === 'quiet') {
      printOneLine(rows);
    }

    if (exitCode > 0 && email) {
      const to = email.split(',');
      const smtp = {
        host: merged.notify?.email?.smtp?.host || 'localhost',
        port: Number(merged.notify?.email?.smtp?.port || 587),
        secure: (merged.notify?.email?.smtp?.secure === 'true') || false,
        auth: { user: merged.notify?.email?.smtp?.auth?.user, pass: merged.notify?.email?.smtp?.auth?.pass }
      };
      const subject = `[Token Usage] status=${rows.map(r=>r.status).join(',')}`;
      const text = rows.map(r => `${r.group}: ${r.total}/${r.cap} (${r.usagePct}) status=${r.status}`).join('\n');
      await sendEmail({ smtp, to, subject, text });
    }

    process.exit(exitCode);
  } catch (err) {
    console.error('Error:', err.message ?? err);
    process.exit(2);
  }
}

export { parseArgs, fmt, printTable, printOneLine, main };

if (import.meta.url === `file://${process.argv[1]}`) main();
