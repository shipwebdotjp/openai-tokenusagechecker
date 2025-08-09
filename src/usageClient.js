import fetch from 'node-fetch';

export async function fetchUsageByModelUTC({ project, startTimeSec, endTimeSec, apiKey, models }) {
  const params = new URLSearchParams({
    start_time: String(startTimeSec),
    end_time: String(endTimeSec),
    group_by: 'model',
    project_ids: project,
  });
  if (models && models.length) {
    for (const m of models) params.append('models', m);
  }

  const url = `https://api.openai.com/v1/organization/usage/completions?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Usage API error: ${res.status} ${body}`);
  }
  const data = await res.json();

  // Convert to Map<model, {input, output, total}>
  const byModel = new Map();
  for (const bucket of data.data ?? []) {
    for (const row of bucket.results ?? []) {
      const model = row.model;
      if (!model) continue;
      const current = byModel.get(model) || { input: 0, output: 0, total: 0 };
      const input = Number(row.input_tokens ?? row.prompt_tokens ?? 0);
      const output = Number(row.output_tokens ?? row.completion_tokens ?? 0);
      const total = Number(row.total_tokens ?? (input + output));
      byModel.set(model, { input: current.input + input, output: current.output + output, total: current.total + total });
    }
  }
  return byModel;
}


