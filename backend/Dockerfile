# Python 3.11の軽量版をベースにする
FROM python:3.11-slim

# Tesseract OCRエンジンと日本語データ、その他の必須ツールをインストール
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-jpn \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app

# パッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# コードをコピー
COPY . .

# FastAPIのデフォルトポート
EXPOSE 8000

# 開発モードで起動（コードを変更したら自動リロード）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]