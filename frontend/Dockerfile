# ベースイメージは先ほどインストールしたNode.js 20の軽量版
FROM node:20-slim

# コンテナ内の作業ディレクトリ
WORKDIR /app

# パッケージの設計図を先にコピーしてインストール
COPY package*.json ./
RUN npm install

# アプリのコードをすべてコピー
COPY . .

# Next.jsのデフォルトポート
EXPOSE 3000

# 開発モード（自動更新オン）で起動
CMD ["npm", "run", "dev"]