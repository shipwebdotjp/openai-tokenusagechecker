export function evaluateStatus(groups, caps, thresholds) {
  const rows = [];
  let exitCode = 0;
  for (const g of Object.keys(caps)) {
    const { input = 0, output = 0, total = 0 } = groups[g] || {};
    const cap = caps[g] || 0;
    const usagePct = cap > 0 ? Math.min(100, (total / cap) * 100) : 0;

    let status = 'OK';
    if (total > cap) { status = 'OVER'; exitCode = Math.max(exitCode, 2); }
    else if (usagePct >= thresholds.alert) { status = 'ALERT'; exitCode = Math.max(exitCode, 2); }
    else if (usagePct >= thresholds.warn) { status = 'WARN'; exitCode = Math.max(exitCode, 1); }

    rows.push({ group: g, input, output, total, cap, usagePct: `${usagePct.toFixed(1)}%`, status });
  }
  return { rows, exitCode };
}


