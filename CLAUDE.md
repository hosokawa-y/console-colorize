# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 応答言語

ユーザーへの応答は日本語で行うこと。

## 概要

GCP コンソールのヘッダー色をプロジェクトごとに変える Chrome 拡張機能 (Manifest V3)。
[yfuruyama/gcp-console-colorize](https://github.com/yfuruyama/gcp-console-colorize) の fork で、Chrome ウェブストアには公開しない（ローカルで unpacked 読み込みして使う）。

## コマンド

ビルド・パッケージマネージャ・テスト・Lint は一切なし。素の JS をそのまま読み込む。

```sh
make package   # 配布用 package.zip を作る
```

動作確認は手動:

1. `chrome://extensions` → デベロッパーモード ON → 「パッケージ化されていない拡張機能を読み込む」でリポジトリのルートを選択
2. コード変更後は `chrome://extensions` の再読み込みボタンを押し、GCP コンソールのタブもリロードする
3. content script のログは GCP コンソールページの DevTools、service worker のログは `chrome://extensions` の「Service Worker」リンクから確認する

ファイルを追加したら **Makefile の zip 対象リストも更新する**（ワイルドカードではなく明示列挙のため漏れやすい）。

## アーキテクチャ

3 つの実行コンテキストがあり、それぞれ別プロセスで動く。

- `main.js` — content script。`manifest.json` の `matches` にマッチしたページで動く本体。
- `background.js` — service worker。ナビゲーション検知専用。
- `options.html` / `options.js` / `options.css` — 設定 UI。`lib/` に jQuery と jqColorPicker をベンダリング（CDN も npm も使わない）。

### SPA 対応のために background.js が存在する

GCP コンソールは SPA なので、プロジェクトを切り替えても content script は再実行されない。そのため `background.js` が `chrome.webNavigation.onHistoryStateUpdated` を購読し、アクティブタブへ空メッセージを送る。`main.js` はそれを `chrome.runtime.onMessage` で受けて `changeHeaderColor()` を再実行する。`webNavigation` 権限はこのためだけに必要。

### 設定のデータ構造

`chrome.storage.sync` にこの形で保存される。options 側と content script 側の両方がこの形を直接触るので、変更するときは両方を揃えること。

```js
{ conditions: [ { pattern: "my-prod-.*", color: { r: 32, g: 100, b: 227 } } ] }
```

`pattern` は URL の `project` クエリパラメータに対して `String.prototype.match` で評価される（= 正規表現。部分一致）。配列の **先頭から順に評価し、最初にマッチした条件の色を適用して終了**。どれにもマッチしなければ `backgroundColor` を `null` に戻して GCP 本来の色に戻す。

### 壊れやすい箇所: ヘッダー要素の特定

`main.js` の `getCurrentHeader()` は複数のセレクタを `||` で繋いだフォールバックチェーンになっている。GCP コンソールの DOM は定期的に変わるため、拡張が効かなくなる原因はほぼここ。**既存のセレクタを置き換えるのではなくチェーンの末尾に追加する**（古い UI が残っている環境があるため）。`matches` の URL も同様に、新しいコンソールの FQDN が出てきたら追加する。現在の対象は `console.cloud.google.com` と `console.cloud.google`（Workforce Identity 連携のコンソール）。

## リリース

ストアに出さないので、変更時は `manifest.json` の `version` を上げて `make package` するだけ。
