-- 対戦履歴（親テーブル）
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- ※Supabase Authと連携する場合は auth.users.id にFKを張る
    season_id INTEGER REFERENCES seasons(id) ON DELETE SET NULL, -- 【追加】対象のシーズン（レギュレーション）ID
    result VARCHAR(10) CHECK (result IN ('win', 'lose', 'draw')) NULL,
    my_team JSONB NULL,    -- 自分の選出ポケモンのID配列 (例: [1, 4, 7])
    memo TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 相手のパーティ（子テーブル）
CREATE TABLE battle_opponent_pokemons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    slot_order SMALLINT NOT NULL CHECK (slot_order BETWEEN 1 AND 6),
    base_pokemon_id INTEGER NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE,
    is_fainted BOOLEAN DEFAULT FALSE,
    is_tera_used BOOLEAN DEFAULT FALSE,
    is_mega_used BOOLEAN DEFAULT FALSE,
    tera_type VARCHAR(20) NULL,
    item_id INTEGER NULL,
    ability_id INTEGER NULL,
    moves JSONB NULL,      -- 判明した技のID配列 (例: [33, 55])
    UNIQUE (battle_id, slot_order) -- 1試合の同じ枠順に複数登録されないための制約
);

-- 高速化のためのインデックス
CREATE INDEX idx_battles_user_id ON battles(user_id);
CREATE INDEX idx_battles_season_id ON battles(season_id); -- 【追加】シーズン絞り込み用インデックス
CREATE INDEX idx_battle_opponent_pokemons_battle_id ON battle_opponent_pokemons(battle_id);