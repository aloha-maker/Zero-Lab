-- ============================================================
-- Poke API ID <-> バトルデータベースID 対応表
-- 生成した poke_api_to_battle_db.csv / mega_evolution_mapping.csv
-- をそのまま取り込める想定のスキーマ
-- ============================================================

-- 1. Poke API ID -> バトルデータベースID
create table if not exists public.pokemon_battle_db_mapping (
  poke_api_id   integer primary key,
  -- "0445-00" 形式。メガシンカ等でバトルデータベース側に対応がない場合は NULL ("なし")
  battle_db_id  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.pokemon_battle_db_mapping is
  'PokeAPIのpokemon ID とバトルデータベースID("XXXX-YY"形式)の対応表';
comment on column public.pokemon_battle_db_mapping.poke_api_id is
  'PokeAPI /pokemon/{id} のID';
comment on column public.pokemon_battle_db_mapping.battle_db_id is
  'バトルデータベース側のID。"0445-00"形式。対応なし(メガシンカ等)はNULL';

-- battle_db_id のフォーマットチェック ("XXXX-YY" or NULL)
alter table public.pokemon_battle_db_mapping
  add constraint chk_battle_db_id_format
  check (battle_db_id is null or battle_db_id ~ '^[0-9]{4}-[0-9]{2}$');

-- battle_db_id で検索しやすいように索引を付与
create index if not exists idx_pokemon_battle_db_mapping_battle_db_id
  on public.pokemon_battle_db_mapping (battle_db_id);


-- 2. メガシンカ前ID -> メガシンカ後ID
create table if not exists public.pokemon_mega_evolution_mapping (
  poke_api_id_before_mega integer not null
    references public.pokemon_battle_db_mapping (poke_api_id)
    on update cascade on delete cascade,
  poke_api_id_mega integer primary key
    references public.pokemon_battle_db_mapping (poke_api_id)
    on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.pokemon_mega_evolution_mapping is
  'メガシンカ前のPoke API ID とメガシンカ後のPoke API IDの対応表';
comment on column public.pokemon_mega_evolution_mapping.poke_api_id_before_mega is
  'メガシンカ前のPoke API ID';
comment on column public.pokemon_mega_evolution_mapping.poke_api_id_mega is
  'メガシンカ後のPoke API ID';

create index if not exists idx_pokemon_mega_evolution_mapping_before
  on public.pokemon_mega_evolution_mapping (poke_api_id_before_mega);


-- 3. updated_at 自動更新トリガー (pokemon_battle_db_mapping用)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pokemon_battle_db_mapping_updated_at
  on public.pokemon_battle_db_mapping;

create trigger trg_pokemon_battle_db_mapping_updated_at
  before update on public.pokemon_battle_db_mapping
  for each row execute function public.set_updated_at();


-- 4. RLS設定 (Supabase APIから参照する場合)
-- 静的なマスターデータとして全員に読み取りを許可する例。
-- 書き込みはservice_role経由(RLSバイパス)のみに限定する想定。
alter table public.pokemon_battle_db_mapping enable row level security;
alter table public.pokemon_mega_evolution_mapping enable row level security;

create policy "Allow public read access"
  on public.pokemon_battle_db_mapping
  for select
  to anon, authenticated
  using (true);

create policy "Allow public read access"
  on public.pokemon_mega_evolution_mapping
  for select
  to anon, authenticated
  using (true);