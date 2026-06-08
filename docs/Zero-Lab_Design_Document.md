# Zero-Lab システム設計書

## 1. アーキテクチャ構成

本システムは、Next.js（フロントエンド）とFastAPI（バックエンド）を核としたマイクロサービス志向のWebアプリケーションです。Docker Composeを用いて環境を一括管理し、開発効率を高めています。

- **Frontend**: Next.js (App Router, Tailwind CSS)
- **Backend**: FastAPI (Python 3.x)
- **Database**: PostgreSQL
- **Infrastructure**: Docker / Docker Compose

## 2. API一覧

| 機能グループ | パス | メソッド | 説明 |
| :--- | :--- | :--- | :--- |
| **Status** | `/status` | GET | ステータス計算 |
| **Damage** | `/damage` | GET | ダメージ計算 |
| **Pokemon** | `/pokemon/{id}` | GET | ポケモン情報取得 |
| **Type** | `/type_matchup` | GET | タイプ相性判定 |
| **Builds** | `/builds` | POST/GET | 育成データの保存・取得 |
| **Parties** | `/parties` | POST/GET | パーティ管理 |
| **Battles** | `/battles` | POST/GET | 対戦記録の作成・履歴の取得 |
| | `/battles/{battle_id}/pokemons` | PUT | 対戦相手のポケモン構成の同期・更新 |
| | `/battles/{battle_id}/result` | PATCH | 対戦結果の更新 |
| | `/battles/advice` | POST | 対戦アドバイスの取得（Gemini API連携） |

## 3. API仕様書（抜粋）

### ポケモン基本情報取得

- **エンドポイント**: `GET /api/pokemon/{name_or_id}`
- **リクエスト**: パスパラメータ `name_or_id` (string)
- **レスポンス**: ポケモンの名前、タイプ、種族値などの詳細情報

### 対戦記録作成

- **エンドポイント**: `POST /api/battles/`
- **リクエスト**: `BattleCreate` スキーマ（対戦相手の情報等）
- **レスポンス**: `BattleResponse` スキーマ

### 対戦アドバイス取得（AI連携）

- **エンドポイント**: `POST /api/battles/advice`
- **リクエスト**: `BattleAdviceRequest` スキーマ
- **レスポンス**: `BattleAdviceResponse` スキーマ
- **説明**: Gemini APIを利用し、現在の対戦状況に基づいたアドバイスを生成します。

## 4. データベース設計 (DDL)

本システムではPostgreSQLを使用し、以下のスキーマでデータを管理します。

### 4.1. テーブル構造概要

| テーブル名 | 説明 |
| :--- | :--- |
| `battles` | 対戦履歴の親テーブル |
| `battle_opponent_pokemons` | 対戦相手のポケモン構成情報 |
| `parties` | パーティ（構築）の基本情報 |
| `party_members` | パーティと育成済みポケモンの紐付け |
| `pokemon_builds` | 育成済みポケモン個体データ |

### 4.2. 主要スキーマ詳細

#### 育成データ (`pokemon_builds`)
性格、努力値、技構成など、個別のポケモン育成データを管理します。個体値や努力値はJSONB型で柔軟に保持します。

#### 対戦記録 (`battles` & `battle_opponent_pokemons`)
対戦結果と、相手が選出したポケモンの詳細（テラスタイプ、アイテム、技など）を階層構造で記録します。

## 5. 画面一覧

| 画面名 | パス | 説明 |
| :--- | :--- | :--- |
| **ダッシュボード** | `/` | 各機能へのゲートウェイ |
| **ステータス計算** | `/status` | 実数値算出ツール |
| **ダメージ計算** | `/damage` | ダメージ範囲確認 |
| **ポケモン図鑑** | `/pokedex` | データ検索 |
| **育成ボックス** | `/builds` | 育成メモ管理 |
| **対戦ツール** | `/battle/new` | 対戦中パーティ記録用 |

## 6. 画面仕様書

### 対戦メモツール (`/battle/new`)

- **機能**: 対戦中に相手の構成をリアルタイムに入力・記録するためのフォーム。
- **主要コンポーネント**:
  - `DetailDrawer`: 選択したポケモンの詳細表示用ドロワー。
  - `PokemonIcon`: 視覚的なポケモン識別表示。
- **データフロー**: 入力された内容は `useBattleStore` を介して状態管理され、最終的にAPIへ送信。
