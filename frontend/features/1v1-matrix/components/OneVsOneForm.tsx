import React from "react";
import { OneVsOneRequest } from "../types";

interface Props {
  requestData: OneVsOneRequest;
  loading: boolean;
  onInputChange: (field: keyof OneVsOneRequest, value: string) => void;
  onEvChange: (statKey: string, value: number) => void;
  onSubmit: () => void;
}

const STAT_KEYS = ["H", "A", "B", "C", "D", "S"];

export const OneVsOneForm: React.FC<Props> = ({
  requestData,
  loading,
  onInputChange,
  onEvChange,
  onSubmit,
}) => {
  return (
    <div className="p-4 border rounded-md shadow-sm bg-white space-y-4 text-black">
      <h2 className="text-xl font-bold">対面シミュレーション設定</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">自分のポケモン</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={requestData.my_pokemon_name}
            onChange={(e) => onInputChange("my_pokemon_name", e.target.value)}
            placeholder="例: ハバタクカミ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">自分の性格</label>
          <select
            className="w-full border p-2 rounded"
            value={requestData.my_nature}
            onChange={(e) => onInputChange("my_nature", e.target.value)}
          >
            <option value="まじめ">まじめ</option>
            <option value="いじっぱり">いじっぱり</option>
            <option value="ひかえめ">ひかえめ</option>
            <option value="おくびょう">おくびょう</option>
            <option value="ようき">ようき</option>
            {/* 必要な性格を追加 */}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">自分の努力値</label>
        <div className="flex gap-2">
          {STAT_KEYS.map((key) => (
            <div key={key} className="flex flex-col items-center">
              <span className="text-xs text-gray-500">{key}</span>
              <input
                type="number"
                min="0"
                max="252"
                className="w-16 border p-1 rounded text-center"
                value={requestData.my_evs[key]}
                onChange={(e) => onEvChange(key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">相手のポケモン (ランキング1位構成を自動適用)</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={requestData.opp_pokemon_name}
          onChange={(e) => onInputChange("opp_pokemon_name", e.target.value)}
          placeholder="例: カイリュー"
        />
      </div>

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={onSubmit}
        disabled={loading || !requestData.my_pokemon_name || !requestData.opp_pokemon_name}
      >
        {loading ? "計算中..." : "シミュレーション実行"}
      </button>
    </div>
  );
};