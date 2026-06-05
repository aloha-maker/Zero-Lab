-- パーティ（構築）の基本情報を保存するテーブル
CREATE TABLE parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  name TEXT NOT NULL,                   -- 構築名 (例: 「S15 最終3桁 サイクル構築」)
  description TEXT,                     -- 構築の概要・コンセプト
  season TEXT                           -- シーズン情報など（拡張用）
);