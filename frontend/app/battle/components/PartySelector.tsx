import React, { useEffect, useState } from 'react';
import { useBattleStore } from '../store/useBattleStore';
import { PokemonBuildResponse } from '../../types/api';

// APIから返却されるパーティの型定義
interface PartyMember {
  build_id: string;
  slot_index: number;
  pokemon_builds: PokemonBuildResponse;
}

interface PartyResponse {
  id: string;
  name?: string;
  party_members: PartyMember[];
}

export const PartySelector = () => {
  const [parties, setParties] = useState<PartyResponse[]>([]);
  const { selectedPartyId, setSelectedParty } = useBattleStore();

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/parties`);
        const data = await res.json();
        const partiesData = data.data;
        setParties(partiesData);
  
        if (partiesData.length > 0) {
          const first = partiesData[0];
          const builds = first.party_members.map((m: PartyMember) => m.pokemon_builds);
          setSelectedParty(first.id, builds);
        }
      } catch (err) {
        console.error("Failed to fetch parties", err);
      }
    };
    fetchParties();
  }, [setSelectedParty]);

  const handlePartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = e.target.value;

    if (!partyId) {
      setSelectedParty(null, []);
      return;
    }

    // p.id も partyId も string型 なので、そのまま厳密比較が可能
    const selected = parties.find(p => p.id === partyId);
    
    // ストア側の setSelectedParty(string | null, PokemonBuildResponse[]) と型が一致します
    setSelectedParty(partyId, selected?.party_members.map(m => m.pokemon_builds) || []);
  };

  return (
    <div className="p-4 border rounded-md bg-gray-800 border-gray-700 shadow-sm mb-4">
      <label className="block text-sm font-medium text-white-700 mb-2">使用パーティ選択</label>
      <select 
        value={selectedPartyId || ''} 
        onChange={handlePartyChange}
        className="w-full p-2 border rounded-md bg-gray-900 text-white border-gray-600"
      >
        <option value="">-- パーティを選択してください --</option>
        {parties.map((party) => (
          <option key={party.id} value={party.id}>
            {party.name || `パーティ ${party.id}`}
          </option>
        ))}
      </select>
    </div>
  );
};