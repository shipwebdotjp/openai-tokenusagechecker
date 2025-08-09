import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function loadConfigFile(filePath) {
  if (!filePath) return {};
  const p = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, 'utf8');
  try {
    if (filePath.endsWith('.json')) return JSON.parse(raw);
    return yaml.load(raw) || {};
  } catch (err) {
    throw new Error(`Failed to parse config ${filePath}: ${err.message}`);
  }
}

export function mergeConfig(base, overrides) {
  return { ...base, ...overrides };
}


