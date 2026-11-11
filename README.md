console-colorize
===

GCP コンソールのヘッダー色をプロジェクトごとに変更する Chrome 拡張機能.

[yfuruyama/gcp-console-colorize](https://github.com/yfuruyama/gcp-console-colorize) を fork して改変したもの.

![screenshot](image/gcp-console-colorize.png)

## Install

**この拡張機能は Chrome ウェブストアには公開していません.** 利用するには、未パッケージ (unpacked) の拡張機能として読み込んでください.

1. このリポジトリを clone する

   ```sh
   git clone <このリポジトリのURL>
   ```

2. Chrome で `chrome://extensions` を開く
3. 右上の「デベロッパーモード」を ON にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、clone したディレクトリを選択する

更新したときは `chrome://extensions` の再読み込みボタンを押してください.

### zip パッケージの作成

配布用の zip を作る場合:

```sh
make package
```

`package.zip` が生成されます.

## Usage

1. 拡張機能の「拡張機能のオプション」を開く
2. プロジェクト ID にマッチする正規表現パターンと、ヘッダーに適用する色を指定する
3. 「save」で保存する

![option](image/gcp-console-colorize-option.png)

複数の条件を登録でき、上から順に評価されて最初にマッチしたものの色が適用されます. どの条件にもマッチしない場合は GCP コンソール本来の色に戻ります.

対象 URL:

- `https://console.cloud.google.com/*`
- `https://console.cloud.google/*` (Workforce Identity 連携のコンソール)

## Fork 元からの主な変更点

- Workforce Identity 用コンソールの FQDN を対象に追加
- Chrome ウェブストアでは公開せず、ローカル読み込みでの利用を前提

## License

Apache License 2.0. [LICENSE](LICENSE) を参照.

オリジナルの著作権は [yfuruyama](https://github.com/yfuruyama) に帰属します.
