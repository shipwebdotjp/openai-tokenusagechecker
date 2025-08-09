export const GROUP_1M = 'group-1M';
export const GROUP_10M = 'group-10M';

export const MODEL_GROUP_MAP = new Map([
  ['gpt-5-2025-08-07', GROUP_1M],
  ['gpt-5-chat-latest', GROUP_1M],
  ['gpt-4.5-preview-2025-02-27', GROUP_1M],
  ['gpt-4.1-2025-04-14', GROUP_1M],
  ['gpt-4o-2024-05-13', GROUP_1M],
  ['gpt-4o-2024-08-06', GROUP_1M],
  ['gpt-4o-2024-11-20', GROUP_1M],
  ['o3-2025-04-16', GROUP_1M],
  ['o1-preview-2024-09-12', GROUP_1M],
  ['o1-2024-12-17', GROUP_1M],

  ['gpt-5-mini-2025-08-07', GROUP_10M],
  ['gpt-5-nano-2025-08-07', GROUP_10M],
  ['gpt-4.1-mini-2025-04-14', GROUP_10M],
  ['gpt-4.1-nano-2025-04-14', GROUP_10M],
  ['gpt-4o-mini-2024-07-18', GROUP_10M],
  ['o4-mini-2025-04-16', GROUP_10M],
  ['o1-mini-2024-09-12', GROUP_10M],
  ['codex-mini-latest', GROUP_10M],
]);

export function groupForModel(model) {
  return MODEL_GROUP_MAP.get(model) || null;
}

export function getCapsByTier(tier) {
  const low = { [GROUP_1M]: 250_000, [GROUP_10M]: 2_500_000 };
  const high = { [GROUP_1M]: 1_000_000, [GROUP_10M]: 10_000_000 };
  return (tier === 1 || tier === 2) ? low : high;
}


