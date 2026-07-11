create table public.type_efficacies (
  damage_type_id integer not null references public.types(id),
  target_type_id integer not null references public.types(id),
  damage_factor integer not null, -- 例: 200(ばつぐん), 50(いまひとつ), 0(効果なし)
  constraint type_efficacies_pkey primary key (damage_type_id, target_type_id)
) TABLESPACE pg_default;