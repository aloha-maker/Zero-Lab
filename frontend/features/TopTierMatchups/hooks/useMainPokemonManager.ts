// frontend/features/TopTierMatchups/hooks/useMainPokemonManager.ts

import { useCallback, useState } from 'react';
import { PokemonInfo } from '@/features/pokedex/types';
import { searchPokemon } from '@/features/pokedex/api/searchPokemon';
import { getBuild } from '@/features/bulids/api/getBuild';
import { NATURES } from '@/features/stat-calculator/types';
import type { BuildCreateRequest, PokemonBuildResponse } from '@/features/bulids/types';
import { ConfiguredMainPokemon } from '../types';

interface UseMainPokemonManagerProps {
  mainPokemon: ConfiguredMainPokemon | null;
  onMainPokemonChange: (pokemon: ConfiguredMainPokemon | null) => void;
}

const emptyEvs = { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 };
const emptyIvs = { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 };

// APIレスポンスやフォーム出力の形が微妙に違っても壊れないように正規化する
const normalizeBuild = (data: any): BuildCreateRequest => ({
  pokemon_id: data.pokemon_id ?? 0,
  pokemon_name: data.pokemon_name ?? '',
  nickname: data.nickname ?? '',
  nature: data.nature ?? '',
  ability: data.ability ?? '',
  item: data.item ?? '',
  tera_type: data.tera_type ?? '',
  moves: data.moves && data.moves.length > 0 ? data.moves : ['', '', '', ''],
  evs: data.evs ?? emptyEvs,
  ivs: data.ivs ?? emptyIvs,
  memo: data.memo ?? '',
});

export const useMainPokemonManager = ({ mainPokemon, onMainPokemonChange }: UseMainPokemonManagerProps) => {
  const [pokemonInfo, setPokemonInfo] = useState<PokemonInfo | undefined>(mainPokemon?.pokemonInfo ?? undefined);
  const [savedBuild, setSavedBuild] = useState<(BuildCreateRequest & { id?: string }) | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [activeBuildId, setActiveBuildId] = useState<string | undefined>(undefined);
  const [activePokemonInfo, setActivePokemonInfo] = useState<PokemonInfo | undefined>(undefined);

  const applyToMainPokemon = useCallback((data: BuildCreateRequest, info: PokemonInfo) => {
    const nature = NATURES.find(n => n.name === data.nature) ?? NATURES[22];
    onMainPokemonChange({
      name: data.pokemon_name,
      pokemonInfo: info,
      nature,
      evs: data.evs,
      realStats: mainPokemon?.realStats ?? { H: null, A: null, B: null, C: null, D: null, S: null },
      tags: mainPokemon?.tags ?? [],
    });
  }, [mainPokemon, onMainPokemonChange]);

  const openAddModal = useCallback(() => {
    setActiveBuildId(undefined);
    setActivePokemonInfo(undefined);
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => setIsAddModalOpen(false), []);

  const closeStatModal = useCallback(() => {
    setIsStatModalOpen(false);
    setActivePokemonInfo(undefined);
    setActiveBuildId(undefined);
  }, []);

  const handleEdit = useCallback(() => {
    setActivePokemonInfo(pokemonInfo);
    setActiveBuildId(savedBuild?.id);
    setIsStatModalOpen(true);
  }, [pokemonInfo, savedBuild]);

  const handleDelete = useCallback(() => {
    setPokemonInfo(undefined);
    setSavedBuild(null);
    onMainPokemonChange(null);
  }, [onMainPokemonChange]);

  // ① 新規検索 → StatFormModalを開く
  const handleSearchSuccess = useCallback((data: PokemonInfo) => {
    setActivePokemonInfo(data);
    setActiveBuildId(undefined);
    setIsAddModalOpen(false);
    setIsStatModalOpen(true);
  }, []);

  // ② 登録済みビルドから選択 → 詳細(evs/ivs/moves)を取得してそのまま確定
  const handleSavedSelect = useCallback(async (build: PokemonBuildResponse) => {
    try {
      const [info, fullBuild] = await Promise.all([
        searchPokemon(build.pokemon_name),
        getBuild(build.id),
      ]);
      const normalized = normalizeBuild(fullBuild);

      setPokemonInfo(info);
      setSavedBuild({ ...normalized, id: build.id });
      applyToMainPokemon(normalized, info);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('ポケモン情報の取得に失敗しました', err);
      alert('ポケモンの追加に失敗しました。');
    }
  }, [applyToMainPokemon]);

  // StatFormModal内のフォーム保存完了時
  const handleStatModalSuccess = useCallback((data: any) => {
    const normalized = normalizeBuild(data);
    const info = activePokemonInfo ?? pokemonInfo;

    setPokemonInfo(info);
    setSavedBuild({ ...normalized, id: activeBuildId ?? (data as any)?.id });
    if (info) applyToMainPokemon(normalized, info);

    closeStatModal();
  }, [activePokemonInfo, pokemonInfo, activeBuildId, applyToMainPokemon, closeStatModal]);

  return {
    pokemonInfo,
    savedBuild,
    hasSelection: !!pokemonInfo,
    isAddModalOpen,
    isStatModalOpen,
    activeBuildId,
    activePokemonInfo,
    openAddModal,
    closeAddModal,
    closeStatModal,
    handleEdit,
    handleDelete,
    handleSearchSuccess,
    handleSavedSelect,
    handleStatModalSuccess,
  };
};