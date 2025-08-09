# openai-tokenusagechecker

A CLI tool to check OpenAI API token usage. It aggregates daily usage by project and can notify when thresholds are exceeded.  
When participating in the data sharing program, you can use up to 1M (250K) / 10M (2.5M) tokens daily depending on your Tier, and this tool allows you to quickly check if you haven't exceeded those limits.

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
- `--display <normal|verbose|quiet>`: Display level. In quiet mode, displays in a single line. In normal mode, displays in table format.

See `config.sample.yml` for configuration file examples.

## Notifications

Email notifications can be sent when thresholds are exceeded. SMTP settings use `notify.email.smtp` in the configuration file.

# Display Examples
## quiet
```
group-1M:85.1K(34.0%)[OK],group-10M:674.5K(27.0%)[OK]
```

## normal
```
┌───────────┬────────┬────────┬────────┬──────┬────────┬────────┐
│ Group     │  Input │ Output │  Total │  Cap │ Usage% │ Status │
├───────────┼────────┼────────┼────────┼──────┼────────┼────────┤
│ group-1M  │  45.9K │  39.2K │  85.1K │ 250K │  34.0% │ OK     │
├───────────┼────────┼────────┼────────┼──────┼────────┼────────┤
│ group-10M │ 647.3K │  27.2K │ 674.5K │ 2.5M │  27.0% │ OK     │
└───────────┴────────┴────────┴────────┴──────┴────────┴────────┘
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