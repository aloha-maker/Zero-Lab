-- 育成済みポケモン管理テーブルの作成
CREATE TABLE pokemon_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 基本情報 (PokeAPI連携用)
  pokemon_id INTEGER NOT NULL,          -- PokeAPIの図鑑番号
  pokemon_name TEXT NOT NULL,           -- 表示用（メガシンカ前）
  nickname TEXT,
  
  -- 個体詳細
  nature TEXT NOT NULL,                 -- 性格
  ability TEXT NOT NULL,                -- 特性
  item TEXT,                            -- 持ち物（メガストーン判定に使用）
  tera_type TEXT,                       -- テラスタイプ
  
  -- 技構成 (可変長配列)
  moves TEXT[] DEFAULT '{}',            -- 技1〜4
  
  -- 努力値・個体値 (JSONBで柔軟に保存)
  -- 例: {"H": 252, "A": 0, "B": 4, "C": 252, "D": 0, "S": 0}
  evs JSONB DEFAULT '{"H": 0, "A": 0, "B": 0, "C": 0, "D": 0, "S": 0}',
  ivs JSONB DEFAULT '{"H": 31, "A": 31, "B": 31, "C": 31, "D": 31, "S": 31}',
  
  -- メモ・調整意図
  memo TEXT
);

-- (オプション) セキュリティ設定: RLS（Row Level Security）の有効化
-- 今回は開発用なので簡易的に全てのアクセスを許可しますが、
-- 本番公開時はユーザー認証(supabase.auth)との紐付けが必要です。
ALTER TABLE pokemon_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON pokemon_builds FOR ALL USING (true);