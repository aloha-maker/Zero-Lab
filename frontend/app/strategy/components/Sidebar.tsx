"use client";

import { TabId } from "../types";

type Props = {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
};

export default function Sidebar({
  activeTab,
  setActiveTab,
}: Props) {
  const getTabClass = (tabId: TabId) => {
    const base =
      "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ";

    return activeTab === tabId
      ? base + "bg-blue-600 text-white"
      : base + "hover:bg-slate-800 text-slate-300";
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          Poke-Builder
        </h1>

        <p className="text-xs text-slate-400 mt-2">
          機械的構築プロセスマネージャー
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => setActiveTab("step1")}
          className={getTabClass("step1")}
        >
          1. 主軸の言語化
        </button>

        <button
          onClick={() => setActiveTab("step2")}
          className={getTabClass("step2")}
        >
          2. 基本の軸(補完)抽出
        </button>

        <button
          onClick={() => setActiveTab("step5")}
          className={getTabClass("step5")}
        >
          5. ステータス逆算計算
        </button>

        <button
          onClick={() => setActiveTab("step6")}
          className={getTabClass("step6")}
        >
          6. 運用KPIトラッカー
        </button>
      </nav>
    </aside>
  );
}