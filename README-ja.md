# openai-tokenusagechecker

OpenAI API のトークン使用量をチェックする CLI ツールです。プロジェクト単位で当日の使用量を集計し、しきい値を超えた場合に通知できます。  
データ共有プログラムに参加すると、Tierに応じて毎日1M(250K)/10M(2.5M)トークンまで使用できますが、そのトークン数を超えていないかをすぐに確認できます。  
OpenAIのデータ共有プログラムに関して詳しくは[こちら](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai)をご覧ください。

## インストール

グローバルインストール:
```
npm install -g openai-tokenusagechecker
```

ローカルインストール（パッケージをローカルで使う場合）:
```
npm install openai-tokenusagechecker
npx openai-tokenusagechecker --project YOUR_PROJECT_ID
```

## 前提

- Node.js >= 16
- 管理用の OpenAI API キー（管理者キー）が必要です。環境変数 `OPENAI_ADMIN_KEY` にセットするか、設定ファイルに `admin_key` を記載してください。

## 使い方

基本的な実行例:
```
export OPENAI_ADMIN_KEY="YOUR_OPENAI_ADMIN_KEY"
openai-tokenusagechecker --project your_project_id
```

主なオプション:
- `--project <project_id>`: 監視対象のプロジェクトID
- `--config <path>`: 設定ファイルのパス（デフォルト: `./config.yml`）
- `--admin-key <key>`: 管理キーを直接指定（環境変数 `OPENAI_ADMIN_KEY` の代替）
- `--email <addr>`: 通知先メールアドレス（設定ファイルの notify.email.to を上書き）
- `--tier <1|2|...>`: あなたのtier 
- `--warn <percent>`: 警告閾値（デフォルト 80）
- `--alert <percent>`: アラート閾値（デフォルト 95）
- `--output-format <oneline|table|debug>`: 出力形式 `oneline` 1行でのサマリー表示, `table` 表形式 (デフォルト), `debug` 表に加えてデバッグ情報を出力します。 省略形: `-o`.

## 設定ファイルのサンプル
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

設定ファイルを使用する場合は`--config <path>`オプションを使用してください。
例
```
openai-tokenusagechecker --config /path/to/config.yml
```


## 通知

しきい値を超えた場合にメールで通知できます。SMTP 設定は設定ファイルの `notify.email.smtp` を使います。

# 表示例
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

## 開発

リポジトリ: https://github.com/shipwebdotjp/openai-tokenusagechecker

テスト:
```
npm test
```

ビルド:
- このパッケージはソースをそのまま配布します。ビルドは不要です（Node.js の ESM を利用）。

## ライセンス

MIT
