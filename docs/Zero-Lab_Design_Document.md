# Zero-Lab システム設計書

## 1. アーキテクチャ構成

本システムは、Next.js（フロントエンド）とFastAPI（バックエンド）を核としたマイクロサービス志向のWebアプリケーションです。Docker Composeを用いて環境を一括管理し、開発効率を高めています。

[Image of System architecture diagram]

- **Frontend**: Next.js (App Router, Tailwind CSS)
- **Backend**: FastAPI (Python 3.x)
- **Infrastructure**: Docker / Docker Compose

## 2. API一覧


| 機能グループ      | パス              | メソッド     | 説明          |
| ----------- | --------------- | -------- | ----------- |
| **Status**  | `/status`       | GET      | ステータス計算     |
| **Damage**  | `/damage`       | GET      | ダメージ計算      |
| **Pokemon** | `/pokemon/{id}` | GET      | ポケモン情報取得    |
| **Type**    | `/type_matchup` | GET      | タイプ相性判定     |
| **Builds**  | `/builds`       | POST/GET | 育成データの保存・取得 |
| **Parties** | `/parties`      | POST/GET | パーティ管理      |
| **Battles** | `/battles`      | POST     | 対戦記録の作成     |


## 3. API仕様書（抜粋）

### ポケモン基本情報取得

- **エンドポイント**: `GET /api/pokemon/{name_or_id}`
- **リクエスト**: パスパラメータ `name_or_id` (string)
- **レスポンス**: ポケモンの名前、タイプ、種族値などの詳細情報

### 対戦記録作成

- **エンドポイント**: `POST /api/battles/`
- **リクエスト**: `BattleCreate` スキーマ（対戦相手の情報等）
- **レスポンス**: `201 Created`

## 4. 画面一覧


| 画面名         | パス            | 説明          |
| ----------- | ------------- | ----------- |
| **ダッシュボード** | `/`           | 各機能へのゲートウェイ |
| **ステータス計算** | `/status`     | 実数値算出ツール    |
| **ダメージ計算**  | `/damage`     | ダメージ範囲確認    |
| **ポケモン図鑑**  | `/pokedex`    | データ検索       |
| **育成ボックス**  | `/builds`     | 育成メモ管理      |
| **対戦ツール**   | `/battle/new` | 対戦中パーティ記録用  |


## 5. 画面仕様書

### 対戦メモツール (`/battle/new`)

- **機能**: 対戦中に相手の構成をリアルタイムに入力・記録するためのフォーム。
- **主要コンポーネント**:
  - `DetailDrawer`: 選択したポケモンの詳細表示用ドロワー。
  - `PokemonIcon`: 視覚的なポケモン識別表示。
- **データフロー**: 入力された内容は `useBattleStore` を介して状態管理され、最終的にAPIへ送信。

