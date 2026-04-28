
* **基本情報**
  * エンドポイント（URI）: 例 `/api/v1/status`
  * HTTPメソッド: POST
  * APIの概要・目的: ステータスを計算する
* **リクエスト（要求）**
  * パスパラメータ: なし
  * クエリパラメータ: なし
  * リクエストボディ: {
    "is_hp": true,             # HPかどうか
    "base_stat": 100,          # 種族値
    "iv": 31,                  # 個体値
    "ev": 252,                 # 努力値
    "level": 50,               # レベル
    "nature_modifier": 1.0     # 性格補正
}
  * リクエストヘッダー: 認証トークン（Bearerトークン）やContent-Typeなど
* **レスポンス（応答）**
  * HTTPステータスコード: `200 OK`
  * レスポンスボディ: {
    "real_stat": 100,
}
* **エラーハンドリング**
  * HTTPステータスコード: `400 Bad Request`
  * エラー時のレスポンスフォーマット: 
    * {
        "detail": "Invalid input values for status calculation."
    }