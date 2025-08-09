import { groupForModel, GROUP_1M, GROUP_10M } from './config.js';

export function aggregateByGroup(byModel) {
  const groups = {
    [GROUP_1M]: { input: 0, output: 0, total: 0 },
    [GROUP_10M]: { input: 0, output: 0, total: 0 },
  };
  for (const [model, usage] of byModel.entries()) {
    const g = groupForModel(model);
    if (!g) continue;
    groups[g].input += usage.input;
    groups[g].output += usage.output;
    groups[g].total += usage.total;
  }
  return groups;
}


