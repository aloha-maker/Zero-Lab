"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { TabId } from "../types";

type Props = {
  children: ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
};

export default function StrategyLayout({
  children,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="bg-slate-50 text-slate-800 font-sans h-screen flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header activeTab={activeTab} />

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}