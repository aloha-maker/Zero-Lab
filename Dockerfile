# 1. ベースとなるOSとNode.jsのバージョンを指定（軽量なスリム版）
FROM node:20-slim

# 2. コンテナの中での作業ディレクトリ（フォルダ）を作成・指定
WORKDIR /usr/src/app

# 3. パッケージの設計図（package.jsonなど）を先にコンテナへコピー
COPY package*.json ./

# 4. コンテナの中でパッケージをインストール（組み立て）
RUN npm install

# 5. 残りのアプリのファイル（index.jsやpublicなど）を全てコピー
COPY . .

# 6. コンテナの3000番ポートを外部に開ける宣言
EXPOSE 3000

# 7. コンテナが起動した時に実行されるコマンド
CMD ["node", "index.js"]