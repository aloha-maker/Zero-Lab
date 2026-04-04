const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// publicフォルダのパスを絶対パスで指定（Vercel環境でのエラーを防ぐため）
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel環境以外（ローカルなど）の時だけサーバーを起動する
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Zero-Lab サンプルアプリがポート ${port} で起動しました！`);
    });
}

// Vercel用にExpressアプリをエクスポートする（重要）
module.exports = app;