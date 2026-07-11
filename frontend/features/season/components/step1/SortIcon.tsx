import { SortKey, SortOrder } from "../../types";

type SortIconProps = {
    targetKey: SortKey;
    currentSortKey: SortKey;
    sortOrder: SortOrder;
};

export function SortIcon({ targetKey, currentSortKey, sortOrder }: SortIconProps) {
    if (currentSortKey !== targetKey) return <span className="text-slate-300 ml-1">↕</span>;
    return sortOrder === "asc" ? <span className="text-blue-500 ml-1">↑</span> : <span className="text-blue-500 ml-1">↓</span>;
}