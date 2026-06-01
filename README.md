# 測量士補 令和7年度版 PWA

このフォルダは、GitHub Pages等で公開するための成果物です。
元PDF、作業メモ、OCR確認中の年度は含まれていません。

## 各ファイルの説明
- public_pwa/service-worker.js: オフライン保存
- public_pwa/manifest.webmanifest: PWA設定
- public_pwa/README.md: 公開手順
- tools/build_public_pwa.py: 公開フォルダ再生成用

## GitHub Pagesで公開

個人情報を含まない公開用リポジトリを作成し、このフォルダの中身だけを
リポジトリ直下へ配置してください。その後、GitHubの
`Settings` → `Pages` で公開します。

## iPadへ保存

1. HTTPSの公開URLをSafariで開きます。
2. 問題と解説を一度表示し、数秒待ちます。
3. Safariの共有ボタンから `ホーム画面に追加` を選びます。
4. 機内モードで起動し、問題、図表、解説が表示されることを確認します。

## ローカル確認

プロジェクト直下で以下を実行します。

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

ブラウザで `http://localhost:8000/public_pwa/` を開きます。
