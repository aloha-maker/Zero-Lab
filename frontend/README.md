```
src/
├── app/ # ① ルーティングと画面の定義（Next.jsのコア）
│ ├── layout.tsx # アプリ共通レイアウト
│ ├── page.tsx # トップページ
│ ├── pokedex/
│ │ ├── page.tsx # 図鑑一覧ページ
│ │ └── [id]/
│ │ page.tsx # ポケモン詳細ページ
│ └── trained/
│ └── page.tsx # 育成ポケモン管理ページ
├── components/ # ② ドメイン（業務知識）を持たない完全共通のUI
│ └── ui/ # ボタン、インプット、ダイアログなどの汎用部品
│ ├── Button.tsx
│ ├── Input.tsx
│ └── Dialog.tsx
├── features/ # ③ 【重要】機能ごとのモジュール（ロジックとUIの分離拠点）
│ ├── pokedex/ # ─── 図鑑・検索ドメイン
│ │ ├── components/ # 見た目（TSX）に集中するファイル
│ │ │ ├── PokedexList.tsx
│ │ │ └── PokemonCard.tsx
│ │ ├── hooks/ # 状態管理・ロジックはここに集中させる（useState, useEffect）
│ │ │ └── usePokemonSearch.ts
│ │ ├── api/ # API通信
│ │ │ ├── searchPokemon.ts
│ │ │ └── getPokemonMaster.ts
│ │ ├── utils/ # Reactに依存しない純粋な関数（検索フィルタなど）
│ │ │ └── filterPokemon.ts
│ │ └── types/ # この機能で使うTypeScriptの型定義
│ │ └── index.ts # Pokemon, Type, Ability などの型
│ └── trained-management/ # ─── 育成管理ドメイン
│ ├── components/
│ │ ├── TrainedList.tsx
│ │ └── StatForm.tsx
│ ├── hooks/
│ │ └── usePokemonStats.ts # 個体値・努力値などの状態を管理するフック
│ ├── utils/
│ │ └── statCalcs.ts # 種族値・個体値・努力値から実数値を出す純粋な計算式
│ └── types/
│ └── index.ts # TrainedPokemon, Party などの型
├── lib/ # ④ 外部ライブラリやクライアントの設定
│ └── api-client.ts # Pythonバックエンド（FastAPI等）への共通Fetch/Axios設定
└── types/ # ⑤ アプリ全体で共有するグローバルな型定義
└── common.ts
```