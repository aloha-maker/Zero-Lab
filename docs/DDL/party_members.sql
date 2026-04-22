-- パーティと育成済みポケモンの紐付け（中間テーブル）
CREATE TABLE party_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID REFERENCES parties(id) ON DELETE CASCADE,
  build_id UUID REFERENCES pokemon_builds(id), -- 育成済み個体への参照
  slot_index INTEGER CHECK (slot_index >= 1 AND slot_index <= 6), -- 1〜6番目の枠
  
  -- 同じパーティ内で同じ枠番号が重複しないように制約
  UNIQUE(party_id, slot_index)
);