# openai-tokenusagechecker

A CLI tool to check OpenAI API token usage. It aggregates daily usage by project and can notify when thresholds are exceeded.  
When participating in the data sharing program, you can use up to 1M (250K) / 10M (2.5M) tokens daily depending on your Tier, and this tool allows you to quickly check if you haven't exceeded those limits.
For more detailed information about OpenAI’s data sharing program, please visit [this page](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai).

## Installation

Global installation:
```
npm install -g openai-tokenusagechecker
```

Local installation (when using the package locally):
```
npm install openai-tokenusagechecker
npx openai-tokenusagechecker --project YOUR_PROJECT_ID
```

## Prerequisites

- Node.js >= 16
- Administrative OpenAI API key (admin key) is required. Set it in the `OPENAI_ADMIN_KEY` environment variable or specify `admin_key` in the configuration file.

## Usage

Basic execution example:
```
export OPENAI_ADMIN_KEY="YOUR_OPENAI_ADMIN_KEY"
openai-tokenusagechecker --project your_project_id
```

Main options:
- `--project <project_id>`: Project ID to monitor
- `--config <path>`: Configuration file path (default: `./config.yml`)
- `--admin-key <key>`: Specify admin key directly (alternative to `OPENAI_ADMIN_KEY` environment variable)
- `--email <addr>`: Notification email address (overrides notify.email.to in config file)
- `--tier <1|2|...>`: Your tier
- `--warn <percent>`: Warning threshold (default 80)
- `--alert <percent>`: Alert threshold (default 95)
- `--output-format <oneline|table|debug>`: Output format. `oneline` prints a compact single-line summary, `table` prints a human-friendly table (default), and `debug` prints the table plus additional JSON debug output to stderr. Short form: `-o`.

## Configuration file sample
`config.yml`
```
project: "YOUR_PROJECT_ID"
admin_key: "YOUR_ADMIN_KEY"
tier: 1
thresholds:
  warn: 80
  alert: 95
notify:
  email:
    to:
      - "YOUR_EMAIL_ADDRESS"
    smtp:
      host: "YOUR_SMTP_HOST"
      port: 587
      secure: true
      auth:
        user: "YOUR_SMTP_USER"
        pass: "YOUR_SMTP_PASSWORD"
runtime:
  timezone: "UTC"
  ignore_unknown_models: true
output:
  format: "table" # oneline, table, debug
```
Example for using config file.
```
openai-tokenusagechecker --config /path/to/config.yml
```

## Notifications

Email notifications can be sent when thresholds are exceeded. SMTP settings use `notify.email.smtp` in the configuration file.

# Display Examples
## oneline
```
group-1M: 85.1K(34.0%)[OK],group-10M: 674.5K(27.0%)[OK]
```

## table
```
┌───────────┬────────┬────────┬────────┬──────┬────────┬────────┐
│ Group     │  Input │ Output │  Total │  Cap │ Usage% │ Status │
├───────────┼────────┼────────┼────────┼──────┼────────┼────────┤
│ group-1M  │  45.9K │  39.2K │  85.1K │ 250K │  34.0% │ OK     │
├───────────┼────────┼────────┼────────┼──────┼────────┼────────┤
│ group-10M │ 647.3K │  27.2K │ 674.5K │ 2.5M │  27.0% │ OK     │
└───────────┴────────┴────────┴────────┴──────┴────────┴────────┘
```

## debug
When run with `--output-format debug` the tool prints the same table output and also emits a JSON dump of `rows` to stderr for troubleshooting:
```
DEBUG rows: [{ "group": "group-1M", "total": 85100, "usagePct": "34.0%", "status": "OK", ... }, ...]
```

## Development

Repository: https://github.com/shipwebdotjp/openai-tokenusagechecker

Testing:
```
npm test
```

Build:
- This package distributes source code as-is. No build process required (uses Node.js ESM).

## License

MIT
