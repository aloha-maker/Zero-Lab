import React, { useState } from 'react';

// ダミーデータ：フェーズ3・4のデータ構造をシミュレート
const initialCandidates = [
  {
    name: 'ハッサム',
    matchups: { 'ハバタクカミ': '◎', 'カイリュー': '◯' },
    archetypeTags: ['鋼枠', 'フェアリー受け', '対ハバタクカミ'],
    passChecks: ['[対面] タスキ/耐久クリア', '[サイクル] 対面操作(とんぼ)'],
    rate: 92,
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    name: 'ヒードラン',
    matchups: { 'ハバタクカミ': '◯', 'カイリュー': '×' },
    archetypeTags: ['特殊受け', '鋼枠', 'サイクル補完'],
    passChecks: ['[サイクル] 回復ソース(たべのこし)'],
    rate: 88,
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'ドオー',
    matchups: { 'ハバタクカミ': '◯', 'カイリュー': '◯' },
    archetypeTags: ['物理受け', 'クッション'],
    passChecks: ['[サイクル] 回復技(じこさいせい)'],
    rate: 81,
    badgeColor: 'bg-yellow-100 text-yellow-700',
  },
];

export default function Step2Screen() {
  const [isScreened, setIsScreened] = useState(false);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      
      {/* メインコントローラー (フェーズ1 & 2) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2">
          <span className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-sm">1</span>
          ターゲットに基づく補完候補の抽出
        </h3>

        {/* フェーズ1のインプット情報 */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              フェーズ1：討伐必須ターゲット（× / △）
            </p>
            <p className="font-bold mt-1 text-red-600 tracking-wide">
              ハバタクカミ, カイリュー
            </p>
          </div>

          <div className="flex-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              フェーズ2：不足しているアーキタイプ要素
            </p>
            <p className="font-bold mt-1 text-slate-700">
              物理受け, 鋼枠
            </p>
          </div>
        </div>

        {/* スクリーニングトリガーボタン */}
        <button 
          onClick={() => setIsScreened(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          タイプ相性・データベースから機械的スクリーニングを実行
        </button>
      </div>

      {/* スクリーニング結果 (フェーズ3 & 4) */}
      {isScreened && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
              <span className="flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-sm">2</span>
              推奨補完候補（フェーズ3・4検証済）
            </h3>
            <span className="text-xs text-slate-400 font-medium">上位50匹から抽出</span>
          </div>

          <div className="space-y-4">
            {initialCandidates.map((pokemon, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-slate-50/50 transition duration-200">
                
                {/* ヘッダー部分 */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-slate-800">{pokemon.name}</h4>
                      <span className={`${pokemon.badgeColor} px-2.5 py-0.5 rounded-full text-xs font-bold`}>
                        適合率 {pokemon.rate}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pokemon.archetypeTags.map((tag, tIdx) => (
                        <span key={tIdx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* パス判定 */}
                  <div className="text-right">
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      採用圏内 (条件クリア)
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100 my-2" />

                {/* 詳細プロセス表示（フェーズ3 & フェーズ4の可視化） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  
                  {/* フェーズ3: 逆引き相性テスト */}
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-1.5">【フェーズ3】対ターゲット相性</p>
                    <div className="flex gap-4 text-xs">
                      {Object.entries(pokemon.matchups).map(([target, result]) => (
                        <div key={target} className="flex items-center gap-1.5">
                          <span className="text-slate-600">{target}:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            result === '◎' ? 'text-emerald-600 bg-emerald-50' : 
                            result === '◯' ? 'text-blue-600 bg-blue-50' : 'text-rose-600 bg-rose-50'
                          }`}>
                            {result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* フェーズ4: 戦術必須パーツチェック */}
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-1.5">【フェーズ4】戦術役割パーツ判定</p>
                    <div className="space-y-1">
                      {pokemon.passChecks.map((check, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1 text-xs text-slate-700">
                          <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="truncate">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* 結論の導出を表示するコールアウト */}
          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
              💡 結論の導出
            </h4>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              スクリーニングの結果、主軸が勝てない「ハバタクカミ」「カイリュー」に対し、確定耐え・確定返しが成立し、かつ選択されたアーキタイプの必須パーツを満たす上記の組合せが最適と判定されました。これで論理的に破綻のない<strong>基本選出の軸（2匹目・3匹目）</strong>が完成します。
            </p>
          </div>
        </div>
      )}
    </section>
  );
}