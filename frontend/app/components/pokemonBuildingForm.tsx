"use client";

import React, { useState, useEffect } from 'react';
import { NATURES } from '../types/constants'

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonStatusState {
  name: string;
  level: number;
  nature: string;
  baseStats: BaseStats;       // 種族値 (Base Stats)
  effortValues: BaseStats;     // 努力値 (Effort Values)
}

const STAT_KEYS: (keyof BaseStats)[] = ["hp", "atk", "def", "spa", "spd", "spe"];
const STAT_LABELS: { [key in keyof BaseStats]: { jp: string;} } = {
  hp: { jp: "HP"},
  atk: { jp: "攻撃"},
  def: { jp: "防御"},
  spa: { jp: "特攻"},
  spd: { jp: "特防"},
  spe: { jp: "素早さ"}
};

// ==========================================
// STATUS CALCULATOR UTILITY
// ==========================================
const calculateSingleStat = (
  key: keyof BaseStats,
  base: number,
  ev: number,
  nature: string,
  level: number
): number => {
  if (key === 'hp') {
    if (base === 1) return 1; // ヌケニン補正
    return Math.floor(((base * 2 + 31 + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  const baseCalc = Math.floor(((base * 2 + 31 + Math.floor(ev / 4)) * level) / 100) + 5;
  const natureObj = NATURES.find(n => n.name === nature);
  if (!natureObj) return baseCalc;

  if (natureObj.up === key) {
    return Math.floor(baseCalc * 1.1);
  }
  if (natureObj.down === key) {
    return Math.floor(baseCalc * 0.9);
  }
  return baseCalc;
};

// ==========================================
// COMPONENT: POKEMON STATUS EDITOR
// ==========================================

interface PokemonStatusEditorProps {
  data: PokemonStatusState;
  onChange: (updatedData: PokemonStatusState) => void;
}

export function PokemonStatusEditor({ data, onChange }: PokemonStatusEditorProps) {
  
  // 努力値の合計値を計算
  const getEVTotal = (evs: BaseStats) => {
    return evs.hp + evs.atk + evs.def + evs.spa + evs.spd + evs.spe;
  };

  const handleStatChange = (key: keyof BaseStats, type: 'baseStats' | 'effortValues', value: number) => {
    const updatedStats = { ...data[type] };
    
    if (type === 'effortValues') {
      const clampedVal = Math.min(32, Math.max(0, value));
      const oldVal = updatedStats[key];
      const otherTotal = getEVTotal(updatedStats) - oldVal;
      
      if (otherTotal + clampedVal <= 32) {
        updatedStats[key] = clampedVal;
      } else {
        updatedStats[key] = Math.max(0, 32 - otherTotal);
      }
    } else {
      updatedStats[key] = Math.min(32, Math.max(1, value));
    }

    onChange({
      ...data,
      [type]: updatedStats
    });
  };

  const handleNatureChange = (natureName: string) => {
    onChange({ ...data, nature: natureName });
  };

  const handleLevelChange = (newLevel: number) => {
    onChange({ ...data, level: Math.min(100, Math.max(1, newLevel)) });
  };

  const handleNameChange = (newName: string) => {
    onChange({ ...data, name: newName });
  };

  const fillRemainingEV = () => {
    const currentTotal = getEVTotal(data.effortValues);
    const remaining = 68 - currentTotal;
    if (remaining <= 0) return;

    const sortedKeys = [...STAT_KEYS].sort((a, b) => data.effortValues[b] - data.effortValues[a]);
    const updatedEVs = { ...data.effortValues };

    for (const key of sortedKeys) {
      const currentVal = updatedEVs[key];
      if (currentVal < 32) { 
        const canAdd = Math.min(32 - currentVal, remaining);
        updatedEVs[key] += canAdd;
        break;
      }
    }

    onChange({ ...data, effortValues: updatedEVs });
  };

  const resetEVs = () => {
    onChange({
      ...data,
      effortValues: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    });
  };

  const currentEVTotal = getEVTotal(data.effortValues);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* ヘッダー部分 */}
      <div className="bg-slate-850 px-6 py-4 border-b border-slate-850/80 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-md font-bold text-slate-100 focus:outline-none w-full"
            placeholder="ポケモン名を入力"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-slate-400 font-semibold">Lv.</span>
            <input
              type="number"
              value={data.level}
              onChange={(e) => handleLevelChange(parseInt(e.target.value) || 50)}
              min={1}
              max={100}
              className="bg-slate-950 border border-slate-700/60 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none w-14 text-center font-bold"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={data.nature}
            onChange={(e) => handleNatureChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/60 focus:border-indigo-500 text-xs font-bold rounded-xl px-3 py-2 text-slate-200 focus:outline-none cursor-pointer"
          >
            {NATURES.map((n) => (
              <option key={n.name} value={n.name}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ステータスリスト */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2 mb-1">
          <div className="col-span-3 sm:col-span-2">ステータス</div>
          <div className="col-span-2 text-center">種族値</div>
          <div className="col-span-3 sm:col-span-4 text-center">努力値</div>
          <div className="col-span-2 text-right">実数値</div>
        </div>

        {STAT_KEYS.map((key) => {
          const label = STAT_LABELS[key];
          const base = data.baseStats[key];
          const ev = data.effortValues[key];
          const finalVal = calculateSingleStat(key, base, ev, data.nature, data.level);

          return (
            <div key={key} className="grid grid-cols-12 gap-2 items-center bg-slate-950/40 hover:bg-slate-950/80 p-3 rounded-xl border border-slate-800/40 transition">
              <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 hidden sm:inline">{label.jp}</span>
              </div>

              <div className="col-span-2 text-center flex justify-center">
                <input
                  type="number"
                  value={base}
                  onChange={(e) => handleStatChange(key, 'baseStats', parseInt(e.target.value) || 0)}
                  className="w-14 text-center bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-1 text-xs font-bold text-slate-100 focus:outline-none"
                />
              </div>

              {/* スライダーと数値入力 */}
              <div className="col-span-3 sm:col-span-4 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={ev}
                  onChange={(e) => handleStatChange(key, 'effortValues', parseInt(e.target.value) || 0)}
                  className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer hidden md:block"
                />
                <input
                  type="number"
                  min={0}
                  max={32}
                  step={1}
                  value={ev}
                  onChange={(e) => handleStatChange(key, 'effortValues', parseInt(e.target.value) || 0)}
                  className="w-14 text-center bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg py-1 text-xs font-bold text-slate-100 focus:outline-none"
                />
              </div>

              <div className="col-span-2 text-right font-black text-sm text-indigo-300">
                {finalVal}
              </div>
            </div>
          );
        })}
      </div>

      {/* フッター集計バー */}
      <div className="bg-slate-850/60 px-6 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto flex-1 max-w-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1.5">
            <span>努力値の合計配分</span>
            <span className={`${currentEVTotal > 68 ? 'text-red-400' : 'text-slate-200'}`}>
              {currentEVTotal} / 68
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                currentEVTotal > 68 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(100, (currentEVTotal / 68) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {currentEVTotal < 68 && (
            <button
              onClick={fillRemainingEV}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] font-extrabold text-slate-200 rounded-lg border border-slate-700 transition"
            >
              残りを極振り
            </button>
          )}
          <button onClick={resetEVs} className="px-2.5 py-1.5 bg-slate-800/50 hover:bg-red-950/40 text-[11px] font-extrabold text-slate-400 hover:text-red-300 rounded-lg transition">
            リセット
          </button>
        </div>
      </div>
    </div>
  );
}