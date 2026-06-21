import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
          ポケモン構築スタジオ
        </h1>
      </div>
    </header>
  );
};