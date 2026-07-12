// frontend/features/matchup-filter/utils/dummyTargets.ts
import type { MatrixResultRow } from "@/features/TopTierMatchups/types";

/**
 * TODO: 本実装ではマトリクス診断機能（実装済み）から取得した
 * MatrixResultRow[] を props 経由で渡す形に差し替える。
 * 現時点はフロント単体での動作確認用のダミーデータ。
 */
export const dummyTargets: MatrixResultRow[] = [
    {
        opponent_rank: 1,
        opponent_name: "カイリュー",
        judgment: "△",
        reason_category: "A：速度負け",
    },
    {
        opponent_rank: 2,
        opponent_name: "ハバタクカミ",
        judgment: "×",
        reason_category: "D：機能停止",
    },
    {
        opponent_rank: 3,
        opponent_name: "ドラパルト",
        judgment: "△",
        reason_category: "C：数値受け",
    },
    {
        opponent_rank: 4,
        opponent_name: "サーフゴー",
        judgment: "×",
        reason_category: "B：行動保障潰し",
    },
    {
        opponent_rank: 5,
        opponent_name: "ガブリアス",
        judgment: "△",
        reason_category: "A：速度負け",
    },
];