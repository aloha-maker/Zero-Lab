import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Zero-Lab",
  description: "Pokémon Battle Assist AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen flex flex-col font-sans">
        {/* ▼▼▼ 全ページ共通のナビゲーションバー ▼▼▼ */}
        <header className="bg-gray-900 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            {/* 左側のロゴ（クリックでトップページへ） */}
            <Link href="/" className="text-xl font-extrabold tracking-widest hover:text-blue-400 transition">
              ZERO-LAB
            </Link>

            {/* 右側のメニューリンク群 */}
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/status" className="hover:text-blue-400 transition">
                ステータス計算
              </Link>
              <Link href="/damage" className="hover:text-blue-400 transition">
                ダメージ計算
              </Link>
              <Link href="/speed" className="hover:text-blue-400 transition">
                すばやさ計算
              </Link>
              <Link href="/pokedex" className="hover:text-blue-400 transition">
                ポケモン図鑑
              </Link>
              <Link href="/type-matchup" className="hover:text-blue-400 transition">
                タイプ相性チェッカー
              </Link>
            </nav>
          </div>
        </header>
        {/* ▲▲▲ ナビゲーションバー ここまで ▲▲▲ */}

        {/* 各ページの中身（page.tsx）がこの {children} の部分に差し込まれます */}
        <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
          {children}
        </div>
      </body>
    </html>
  );
}