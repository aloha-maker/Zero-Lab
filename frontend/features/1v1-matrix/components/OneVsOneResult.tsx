import React from "react";
import { OneVsOneResponse } from "../types";

interface Props {
  result: OneVsOneResponse;
}

export const OneVsOneResult: React.FC<Props> = ({ result }) => {
  return (
    <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-md overflow-x-auto mt-4">
      <p>==================================================</p>
      <p>
        【対面シミュレーション】攻撃側: {result.my_pokemon_name} vs 相手: {result.opp_pokemon_name}
      </p>
      <p>
        &nbsp;&nbsp;■ S関係: 自分S={result.my_detail.speed_real} | 相手S={result.opp_detail.speed_real} ➔ 行動順: {result.action_order}
      </p>
      <p>&nbsp;&nbsp;■ 自分 ➔ 相手:</p>
      <p>
        &nbsp;&nbsp;&nbsp;&nbsp;- 使用技: {result.my_detail.best_move_name} ({result.my_detail.best_move_type} / 威力:{result.my_detail.best_move_power})
      </p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;- 相性倍率: {result.my_detail.type_multiplier}倍</p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;- 撃破ターン数: {result.my_detail.turns_to_kill}ターン</p>
      <p>&nbsp;&nbsp;■ 相手 ➔ 自分:</p>
      <p>
        &nbsp;&nbsp;&nbsp;&nbsp;- 使用技: {result.opp_detail.best_move_name} ({result.opp_detail.best_move_type} / 威力:{result.opp_detail.best_move_power})
      </p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;- 相性倍率: {result.opp_detail.type_multiplier}倍</p>
      <p>&nbsp;&nbsp;&nbsp;&nbsp;- 被撃破ターン数: {result.opp_detail.turns_to_kill}ターン</p>
      <p className="text-yellow-400">
        &nbsp;&nbsp;➔ 判定結果: {result.judgment} (カテゴリ: {result.reason_category || "None"})
      </p>
      <p>==================================================</p>
    </div>
  );
};