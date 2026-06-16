import { TAB_TITLES } from "../constants";
import { TabId } from "../types";

type Props = {
  activeTab: TabId;
};

export default function Header({
  activeTab,
}: Props) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <h2 className="text-xl font-bold text-slate-800">
        {TAB_TITLES[activeTab]}
      </h2>

      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
        現在のアーキタイプ: 判定中
      </span>
    </header>
  );
}