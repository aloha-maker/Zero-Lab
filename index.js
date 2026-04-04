const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 静的ファイル（HTMLなど）を「public」フォルダから読み込む設定
app.use(express.static('public'));

// ルートパス（/）へのアクセスで「index.html」を表示する
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバーを起動
app.listen(port, () => {
    console.log(`Zero-Lab サンプルアプリがポート ${port} で起動しました！`);
    console.log(`ブラウザで http://localhost:${port} を開いてください`);
});