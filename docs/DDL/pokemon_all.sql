-- ==========================================
-- ポケモンデータベース初期化 SQLスクリプト
-- ==========================================

-- 1. 既存のテーブルを削除 (依存関係を考慮して子テーブルから削除)
DROP TABLE IF EXISTS public.pokemon_moves CASCADE;
DROP TABLE IF EXISTS public.moves CASCADE;
DROP TABLE IF EXISTS public.pokemon_abilities CASCADE;
DROP TABLE IF EXISTS public.abilities CASCADE;
DROP TABLE IF EXISTS public.pokemon_types CASCADE;
DROP TABLE IF EXISTS public.types CASCADE;
DROP TABLE IF EXISTS public.pokemon CASCADE;
DROP TABLE IF EXISTS public.pokemon_species CASCADE;

-- ==========================================
-- テーブル作成
-- ==========================================

-- 1. pokemon_species (ポケモン種族マスター)
CREATE TABLE public.pokemon_species (
  id INTEGER PRIMARY KEY,
  national_dex_no INTEGER NOT NULL,
  name_ja TEXT,
  name_en TEXT NOT NULL
);

-- 2. pokemon (個別のフォルムデータ)
CREATE TABLE public.pokemon (
  id INTEGER PRIMARY KEY,
  species_id INTEGER NOT NULL REFERENCES public.pokemon_species(id) ON DELETE CASCADE,
  form_category TEXT NOT NULL,
  form_name_ja TEXT,
  form_name_en TEXT,
  hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  sp_attack INTEGER NOT NULL,
  sp_defense INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  height_dm INTEGER NOT NULL,
  weight_hg INTEGER NOT NULL,
  image_url TEXT
);

-- 3. types (タイプマスター)
CREATE TABLE public.types (
  id INTEGER PRIMARY KEY,
  name_ja TEXT,
  name_en TEXT NOT NULL
);

-- 4. pokemon_types (ポケモンとタイプの紐付け)
CREATE TABLE public.pokemon_types (
  pokemon_id INTEGER NOT NULL REFERENCES public.pokemon(id) ON DELETE CASCADE,
  type_id INTEGER NOT NULL REFERENCES public.types(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL,
  PRIMARY KEY (pokemon_id, type_id)
);

-- 5. abilities (特性マスター)
CREATE TABLE public.abilities (
  id INTEGER PRIMARY KEY,
  name_ja TEXT,
  name_en TEXT NOT NULL
);

-- 6. pokemon_abilities (ポケモンと特性の紐付け)
CREATE TABLE public.pokemon_abilities (
  pokemon_id INTEGER NOT NULL REFERENCES public.pokemon(id) ON DELETE CASCADE,
  ability_id INTEGER NOT NULL REFERENCES public.abilities(id) ON DELETE CASCADE,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  slot INTEGER NOT NULL,
  PRIMARY KEY (pokemon_id, ability_id)
);

-- 7. moves (技マスター)
-- power / accuracy は「へんしん」「たきのぼり(変化技)」などステータス技の場合NULLになりうる
CREATE TABLE public.moves (
  id INTEGER PRIMARY KEY,
  name_ja TEXT,
  name_en TEXT NOT NULL,
  type_id INTEGER REFERENCES public.types(id) ON DELETE SET NULL,
  damage_class TEXT,
  power INTEGER,
  pp INTEGER,
  accuracy INTEGER,
  priority INTEGER
);

-- 8. pokemon_moves (ポケモンが覚える技)
CREATE TABLE public.pokemon_moves (
  pokemon_id INTEGER NOT NULL REFERENCES public.pokemon(id) ON DELETE CASCADE,
  move_id INTEGER NOT NULL REFERENCES public.moves(id) ON DELETE CASCADE,
  PRIMARY KEY (pokemon_id, move_id)
);

-- ==========================================
-- パフォーマンス最適化 (外部キーへのインデックス)
-- ==========================================
-- 読み取り時のJOINを高速化するためにインデックスを付与します。
CREATE INDEX IF NOT EXISTS idx_pokemon_species_id ON public.pokemon(species_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_types_pokemon_id ON public.pokemon_types(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_abilities_pokemon_id ON public.pokemon_abilities(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_moves_type_id ON public.moves(type_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_moves_pokemon_id ON public.pokemon_moves(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_moves_move_id ON public.pokemon_moves(move_id);

-- ==========================================
-- RLS (Row Level Security) の設定
-- ==========================================
-- すべてのテーブルでRLSを有効化します。
ALTER TABLE public.pokemon_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pokemon_moves ENABLE ROW LEVEL SECURITY;

-- 一般ユーザー（匿名含む）への SELECT (読み取り) 権限の付与
-- ※ service_role キーを用いたバッチ処理は、デフォルトでRLSをバイパス(無視)して
--    INSERT/UPDATE/DELETE が可能なため、書き込み用のポリシー定義は不要です。

CREATE POLICY "Allow public read-only access" ON public.pokemon_species FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.pokemon FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.types FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.pokemon_types FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.abilities FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.pokemon_abilities FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.moves FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access" ON public.pokemon_moves FOR SELECT USING (true);