import React from 'react';
import Link from 'next/link';

// 仮のデータ構造（実際のアプリケーションに合わせて調整してください）
interface PartyMember {
  id: string; // 編集ページの [id] に入る識別子
  name: string;
  role?: string;
}

export const RightSidebar: React.FC = () => {
  // 本来は useState や API、Props から取得するパーティメンバーのデータ
  const partyMembers: PartyMember[] = [
    { id: 'build-001', name: 'ガブリアス', role: '-' },
    { id: 'build-002', name: 'ムクホーク', role: '-' },
    { id: 'build-003', name: 'イダイトウ', role: '-' },
    { id: 'build-004', name: '未設定', role: '-' },
    { id: 'build-005', name: '未設定', role: '-' },
    { id: 'build-006', name: '未設定', role: '-' },
  ];

  return (
    <aside className="w-full lg:w-80 bg-slate-900/70 lg:border-r border-slate-800 flex flex-col max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
          現在のパーティメンバー
        </h2>
        
        {/* 縦に6つの枠（rows）を作る */}
        <div className="grid grid-rows-6 gap-2">
          {partyMembers.map((member, index) => (
            <Link
              key={member.id + index}
              // href に編集ページのパスを指定し、[id] の部分に member.id を埋め込む
              href={`/builds/edit/${member.id}`}
              className="h-20 border border-slate-800 bg-slate-800/40 rounded-lg p-3 flex flex-col justify-center text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 transition-colors group"
            >
              <div className="text-xs text-slate-500 font-bold">SLOT {index + 1}</div>
              <div className="flex justify-between items-center w-full mt-0.5">
                <span className="font-medium group-hover:text-amber-400 transition-colors">
                  {member.name}
                </span>
                {member.role && (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                    {member.role}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};