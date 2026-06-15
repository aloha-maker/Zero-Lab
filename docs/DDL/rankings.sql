-- ==========================================================
-- 1. 親テーブル: ポケモン基本情報 & ランキング
-- ==========================================================
CREATE TABLE pokemon_rankings (
    id VARCHAR(20) PRIMARY KEY,       -- ポケモンID (例: '0445-00')
    name VARCHAR(100) NOT NULL,       -- ポケモン名 (例: 'ガブリアス')
    rank INTEGER NOT NULL,            -- 使用率順位 (例: 1)
    detail_url TEXT,                  -- 詳細ページURL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. 子テーブル: 採用技 (1対多の関係)
-- ==========================================================
CREATE TABLE pokemon_moves_rankings (
    id BIGSERIAL PRIMARY KEY,
    pokemon_id VARCHAR(20) REFERENCES pokemon_rankings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,            -- 各ポケモン内での技の順位
    move_name VARCHAR(100) NOT NULL,  -- 技名
    usage_rate NUMERIC(5,2) NOT NULL, -- 採用率 (%) ※数値として格納
    move_type VARCHAR(50),            -- 技のタイプ (じめん, いわ 等)
    category VARCHAR(50),             -- 分類 (物理, 特殊, 変化)
    power INTEGER,                    -- 威力 (NULL許容)
    accuracy INTEGER,                 -- 命中 (NULL許容)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. 子テーブル: 特性採用率 (1対多の関係)
-- ==========================================================
CREATE TABLE pokemon_abilities_rankings (
    id BIGSERIAL PRIMARY KEY,
    pokemon_id VARCHAR(20) REFERENCES pokemon_rankings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,            -- 特性の順位
    ability_name VARCHAR(100) NOT NULL, -- 特性名
    usage_rate NUMERIC(5,2) NOT NULL, -- 採用率 (%)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 4. 子テーブル: 性格採用率 (1対多の関係)
-- ==========================================================
CREATE TABLE pokemon_natures_rankings (
    id BIGSERIAL PRIMARY KEY,
    pokemon_id VARCHAR(20) REFERENCES pokemon_rankings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,            -- 性格の順位
    nature_name VARCHAR(100) NOT NULL, -- 性格名 (補正情報含む)
    usage_rate NUMERIC(5,2) NOT NULL, -- 採用率 (%)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. 子テーブル: 持ち物採用率 (1対多の関係)
-- ==========================================================
CREATE TABLE pokemon_items_rankings (
    id BIGSERIAL PRIMARY KEY,
    pokemon_id VARCHAR(20) REFERENCES pokemon_rankings(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,            -- 持ち物の順位
    item_name VARCHAR(100) NOT NULL,  -- 持ち物名
    usage_rate NUMERIC(5,2) NOT NULL, -- 採用率 (%)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 8. インデックスの作成（クエリの高速化用）
-- ==========================================================
CREATE INDEX idx_pokemon_moves_pokemon_id ON pokemon_moves_rankings(pokemon_id);
CREATE INDEX idx_pokemon_abilities_pokemon_id ON pokemon_abilities_rankings(pokemon_id);
CREATE INDEX idx_pokemon_natures_pokemon_id ON pokemon_natures_rankings(pokemon_id);
CREATE INDEX idx_pokemon_items_pokemon_id ON pokemon_items_rankings(pokemon_id);


ALTER TABLE public.pokemon_battle_db_mapping
ADD CONSTRAINT fk_pokemon_battle_db_id
FOREIGN KEY (battle_db_id)
REFERENCES public.pokemon_rankings(id)
NOT VALID; -- 既存のデータエラー（0001-00など）をスルーします