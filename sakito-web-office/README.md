# Sakito Web オフィス 1F ラウンジ(通話版)

Remoのように、テーブルに座った人どうしだけで声と映像がつながるバーチャルオフィスです。

- `index.html`:フロアの画面。通話はLiveKitを使います。
- `api/token.js`:合言葉を確認して、入室許可証(トークン)を発行するVercelの関数です。
- `package.json`:関数で使うライブラリ(livekit-server-sdk)の一覧です。

## Vercelの環境変数

Vercelのプロジェクトの Settings → Environment Variables に、次の4つを登録します。

| 名前 | 値 |
|---|---|
| `LIVEKIT_URL` | `wss://sakito-web-bachiyaruofuisu-5thisdng.livekit.cloud` |
| `LIVEKIT_API_KEY` | LiveKitのAPIキー(`API`で始まる文字列) |
| `LIVEKIT_API_SECRET` | LiveKitのAPIシークレット(他人に見せない) |
| `ROOM_PASSCODE` | 入室用の合言葉(知り合いやクライアントに伝えるもの) |

環境変数を追加・変更したあとは、Deployments から Redeploy しないと反映されません。

## 仕組み

- 1階のラウンジ全体が、LiveKitの1つの通話ルーム(`sakito-web-2f`)になっています。
- 各参加者は「どのテーブルにいるか」という情報を持っています。同じテーブルの人の音声と映像だけを受け取ります。
- 席を立つと、自分のカメラとマイクは自動で止まります。
- テーブルチャットは、同じテーブルの人にだけ送られます。履歴は保存されません。
