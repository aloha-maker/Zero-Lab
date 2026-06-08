-- ルール（レギュレーション）管理
CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL -- 例: "レギュレーションG"
);

-- シーズン管理（ルールに紐づく）
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES rules(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL, -- 例: "シーズン18"
    start_date DATE NULL,
    end_date DATE NULL
);

-- ルールごとの使用可能ポケモン管理
CREATE TABLE rule_available_pokemons (
    rule_id INTEGER REFERENCES rules(id) ON DELETE CASCADE,
    pokemon_id INTEGER NOT NULL,
    PRIMARY KEY (rule_id, pokemon_id)
);