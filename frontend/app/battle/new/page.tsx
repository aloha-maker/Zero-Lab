'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

// ==========================================
// マスターデータとユーティリティ関数
// ==========================================

// 仮のマスターデータ（※本番では既存APIから取得します）
const POKEMON_MASTER = [
  { id: 3000, name: 'フシギバナ', kana: 'フシギバナ' },
  { id: 6000, name: 'リザードン', kana: 'リザードン' },
  { id: 9000, name: 'カメックス', kana: 'カメックス' },
  { id: 15000, name: 'スピアー', kana: 'スピアー' },
  { id: 18000, name: 'ピジョット', kana: 'ピジョット' },
  { id: 24000, name: 'アーボック', kana: 'アーボック' },
  { id: 25000, name: 'ピカチュウ', kana: 'ピカチュウ' },
  { id: 26000, name: 'ライチュウ', kana: 'ライチュウ' },
  { id: 26001, name: 'ライチュウ (アローラのすがた)', kana: 'ライチュウ (アローラのすがた)' },
  { id: 36000, name: 'ピクシー', kana: 'ピクシー' },
  { id: 38000, name: 'キュウコン', kana: 'キュウコン' },
  { id: 38001, name: 'キュウコン (アローラのすがた)', kana: 'キュウコン (アローラのすがた)' },
  { id: 59000, name: 'ウインディ', kana: 'ウインディ' },
  { id: 59001, name: 'ウインディ (ヒスイのすがた)', kana: 'ウインディ (ヒスイのすがた)' },
  { id: 65000, name: 'フーディン', kana: 'フーディン' },
  { id: 68000, name: 'カイリキー', kana: 'カイリキー' },
  { id: 71000, name: 'ウツボット', kana: 'ウツボット' },
  { id: 80000, name: 'ヤドラン', kana: 'ヤドラン' },
  { id: 80002, name: 'ヤドラン (ガラルのすがた)', kana: 'ヤドラン (ガラルのすがた)' },
  { id: 94000, name: 'ゲンガー', kana: 'ゲンガー' },
  { id: 115000, name: 'ガルーラ', kana: 'ガルーラ' },
  { id: 121000, name: 'スターミー', kana: 'スターミー' },
  { id: 127000, name: 'カイロス', kana: 'カイロス' },
  { id: 128000, name: 'ケンタロス', kana: 'ケンタロス' },
  { id: 128001, name: 'ケンタロス (パルデアのすがた・コンバットしゅ)', kana: 'ケンタロス (パルデアのすがた・コンバットしゅ)' },
  { id: 128002, name: 'ケンタロス (パルデアのすがた・ブレイズしゅ)', kana: 'ケンタロス (パルデアのすがた・ブレイズしゅ)' },
  { id: 128003, name: 'ケンタロス (パルデアのすがた・ウォーターしゅ)', kana: 'ケンタロス (パルデアのすがた・ウォーターしゅ)' },
  { id: 130000, name: 'ギャラドス', kana: 'ギャラドス' },
  { id: 132000, name: 'メタモン', kana: 'メタモン' },
  { id: 134000, name: 'シャワーズ', kana: 'シャワーズ' },
  { id: 135000, name: 'サンダース', kana: 'サンダース' },
  { id: 136000, name: 'ブースター', kana: 'ブースター' },
  { id: 142000, name: 'プテラ', kana: 'プテラ' },
  { id: 143000, name: 'カビゴン', kana: 'カビゴン' },
  { id: 149000, name: 'カイリュー', kana: 'カイリュー' },
  { id: 154000, name: 'メガニウム', kana: 'メガニウム' },
  { id: 157000, name: 'バクフーン', kana: 'バクフーン' },
  { id: 157001, name: 'バクフーン (ヒスイのすがた)', kana: 'バクフーン (ヒスイのすがた)' },
  { id: 160000, name: 'オーダイル', kana: 'オーダイル' },
  { id: 168000, name: 'アリアドス', kana: 'アリアドス' },
  { id: 181000, name: 'デンリュウ', kana: 'デンリュウ' },
  { id: 184000, name: 'マリルリ', kana: 'マリルリ' },
  { id: 186000, name: 'ニョロトノ', kana: 'ニョロトノ' },
  { id: 196000, name: 'エーフィ', kana: 'エーフィ' },
  { id: 197000, name: 'ブラッキー', kana: 'ブラッキー' },
  { id: 199000, name: 'ヤドキング', kana: 'ヤドキング' },
  { id: 199001, name: 'ヤドキング (ガラルのすがた)', kana: 'ヤドキング (ガラルのすがた)' },
  { id: 205000, name: 'フォレトス', kana: 'フォレトス' },
  { id: 208000, name: 'ハガネール', kana: 'ハガネール' },
  { id: 212000, name: 'ハッサム', kana: 'ハッサム' },
  { id: 214000, name: 'ヘラクロス', kana: 'ヘラクロス' },
  { id: 227000, name: 'エアームド', kana: 'エアームド' },
  { id: 229000, name: 'ヘルガー', kana: 'ヘルガー' },
  { id: 248000, name: 'バンギラス', kana: 'バンギラス' },
  { id: 279000, name: 'ペリッパー', kana: 'ペリッパー' },
  { id: 282000, name: 'サーナイト', kana: 'サーナイト' },
  { id: 302000, name: 'ヤミラミ', kana: 'ヤミラミ' },
  { id: 306000, name: 'ボスゴドラ', kana: 'ボスゴドラ' },
  { id: 308000, name: 'チャーレム', kana: 'チャーレム' },
  { id: 310000, name: 'ライボルト', kana: 'ライボルト' },
  { id: 319000, name: 'サメハダー', kana: 'サメハダー' },
  { id: 323000, name: 'バクーダ', kana: 'バクーダ' },
  { id: 324000, name: 'コータス', kana: 'コータス' },
  { id: 334000, name: 'チルタリス', kana: 'チルタリス' },
  { id: 350000, name: 'ミロカロス', kana: 'ミロカロス' },
  { id: 351000, name: 'ポワルン', kana: 'ポワルン' },
  { id: 354000, name: 'ジュペッタ', kana: 'ジュペッタ' },
  { id: 358000, name: 'チリーン', kana: 'チリーン' },
  { id: 359000, name: 'アブソル', kana: 'アブソル' },
  { id: 362000, name: 'オニゴーリ', kana: 'オニゴーリ' },
  { id: 389000, name: 'ドダイトス', kana: 'ドダイトス' },
  { id: 392000, name: 'ゴウカザル', kana: 'ゴウカザル' },
  { id: 395000, name: 'エンペルト', kana: 'エンペルト' },
  { id: 405000, name: 'レントラー', kana: 'レントラー' },
  { id: 407000, name: 'ロズレイド', kana: 'ロズレイド' },
  { id: 409000, name: 'ラムパルド', kana: 'ラムパルド' },
  { id: 411000, name: 'トリデプス', kana: 'トリデプス' },
  { id: 428000, name: 'ミミロップ', kana: 'ミミロップ' },
  { id: 442000, name: 'ミカルゲ', kana: 'ミカルゲ' },
  { id: 445000, name: 'ガブリアス', kana: 'ガブリアス' },
  { id: 448000, name: 'ルカリオ', kana: 'ルカリオ' },
  { id: 450000, name: 'カバルドン', kana: 'カバルドン' },
  { id: 454000, name: 'ドクロッグ', kana: 'ドクロッグ' },
  { id: 460000, name: 'ユキノオー', kana: 'ユキノオー' },
  { id: 461000, name: 'マニューラ', kana: 'マニューラ' },
  { id: 464000, name: 'ドサイドン', kana: 'ドサイドン' },
  { id: 470000, name: 'リーフィア', kana: 'リーフィア' },
  { id: 471000, name: 'グレイシア', kana: 'グレイシア' },
  { id: 472000, name: 'グライオン', kana: 'グライオン' },
  { id: 473000, name: 'マンムー', kana: 'マンムー' },
  { id: 475000, name: 'エルレイド', kana: 'エルレイド' },
  { id: 478000, name: 'ユキメノコ', kana: 'ユキメノコ' },
  { id: 479000, name: 'ロトム (ロトムのすがた)', kana: 'ロトム (ロトムのすがた)' },
  { id: 479001, name: 'ロトム (ヒートロトム)', kana: 'ロトム (ヒートロトム)' },
  { id: 479002, name: 'ロトム (ウォッシュロトム)', kana: 'ロトム (ウォッシュロトム)' },
  { id: 479003, name: 'ロトム (フロストロトム)', kana: 'ロトム (フロストロトム)' },
  { id: 479004, name: 'ロトム (スピンロトム)', kana: 'ロトム (スピンロトム)' },
  { id: 479005, name: 'ロトム (カットロトム)', kana: 'ロトム (カットロトム)' },
  { id: 497000, name: 'ジャローダ', kana: 'ジャローダ' },
  { id: 500000, name: 'エンブオー', kana: 'エンブオー' },
  { id: 503000, name: 'ダイケンキ', kana: 'ダイケンキ' },
  { id: 503001, name: 'ダイケンキ (ヒスイのすがた)', kana: 'ダイケンキ (ヒスイのすがた)' },
  { id: 505000, name: 'ミルホッグ', kana: 'ミルホッグ' },
  { id: 510000, name: 'レパルダス', kana: 'レパルダス' },
  { id: 512000, name: 'ヤナッキー', kana: 'ヤナッキー' },
  { id: 514000, name: 'バオッキー', kana: 'バオッキー' },
  { id: 516000, name: 'ヒヤッキー', kana: 'ヒヤッキー' },
  { id: 530000, name: 'ドリュウズ', kana: 'ドリュウズ' },
  { id: 531000, name: 'タブンネ', kana: 'タブンネ' },
  { id: 534000, name: 'ローブシン', kana: 'ローブシン' },
  { id: 547000, name: 'エルフーン', kana: 'エルフーン' },
  { id: 553000, name: 'ワルビアル', kana: 'ワルビアル' },
  { id: 563000, name: 'デスカーン', kana: 'デスカーン' },
  { id: 569000, name: 'ダストダス', kana: 'ダストダス' },
  { id: 571000, name: 'ゾロアーク', kana: 'ゾロアーク' },
  { id: 571001, name: 'ゾロアーク (ヒスイのすがた)', kana: 'ゾロアーク (ヒスイのすがた)' },
  { id: 579000, name: 'ランクルス', kana: 'ランクルス' },
  { id: 584000, name: 'バイバニラ', kana: 'バイバニラ' },
  { id: 587000, name: 'エモンガ', kana: 'エモンガ' },
  { id: 609000, name: 'シャンデラ', kana: 'シャンデラ' },
  { id: 614000, name: 'ツンベアー', kana: 'ツンベアー' },
  { id: 618000, name: 'マッギョ', kana: 'マッギョ' },
  { id: 618001, name: 'マッギョ (ガラルのすがた)', kana: 'マッギョ (ガラルのすがた)' },
  { id: 623000, name: 'ゴルーグ', kana: 'ゴルーグ' },
  { id: 635000, name: 'サザンドラ', kana: 'サザンドラ' },
  { id: 637000, name: 'ウルガモス', kana: 'ウルガモス' },
  { id: 652000, name: 'ブリガロン', kana: 'ブリガロン' },
  { id: 655000, name: 'マフォクシー', kana: 'マフォクシー' },
  { id: 658000, name: 'ゲッコウガ', kana: 'ゲッコウガ' },
  { id: 660000, name: 'ホルード', kana: 'ホルード' },
  { id: 663000, name: 'ファイアロー', kana: 'ファイアロー' },
  { id: 666018, name: 'ビビヨン', kana: 'ビビヨン' },
  { id: 670005, name: 'フラエッテ', kana: 'フラエッテ' },
  { id: 671000, name: 'フラージェス', kana: 'フラージェス' },
  { id: 675000, name: 'ゴロンダ', kana: 'ゴロンダ' },
  { id: 676000, name: 'トリミアン', kana: 'トリミアン' },
  { id: 678000, name: 'ニャオニクス (オスのすがた)', kana: 'ニャオニクス (オスのすがた)' },
  { id: 678001, name: 'ニャオニクス (メスのすがた)', kana: 'ニャオニクス (メスのすがた)' },
  { id: 681000, name: 'ギルガルド', kana: 'ギルガルド' },
  { id: 683000, name: 'フレフワン', kana: 'フレフワン' },
  { id: 685000, name: 'ペロリーム', kana: 'ペロリーム' },
  { id: 693000, name: 'ブロスター', kana: 'ブロスター' },
  { id: 695000, name: 'エレザード', kana: 'エレザード' },
  { id: 697000, name: 'ガチゴラス', kana: 'ガチゴラス' },
  { id: 699000, name: 'アマルルガ', kana: 'アマルルガ' },
  { id: 700000, name: 'ニンフィア', kana: 'ニンフィア' },
  { id: 701000, name: 'ルチャブル', kana: 'ルチャブル' },
  { id: 702000, name: 'デデンネ', kana: 'デデンネ' },
  { id: 706000, name: 'ヌメルゴン', kana: 'ヌメルゴン' },
  { id: 706001, name: 'ヌメルゴン (ヒスイのすがた)', kana: 'ヌメルゴン (ヒスイのすがた)' },
  { id: 707000, name: 'クレッフィ', kana: 'クレッフィ' },
  { id: 709000, name: 'オーロット', kana: 'オーロット' },
  { id: 711000, name: 'パンプジン (ちゅうだましゅ)', kana: 'パンプジン (ちゅうだましゅ)' },
  { id: 711001, name: 'パンプジン (こだましゅ)', kana: 'パンプジン (こだましゅ)' },
  { id: 711002, name: 'パンプジン (おおだましゅ)', kana: 'パンプジン (おおだましゅ)' },
  { id: 711003, name: 'パンプジン (ギガだましゅ)', kana: 'パンプジン (ギガだましゅ)' },
  { id: 713000, name: 'クレベース', kana: 'クレベース' },
  { id: 713001, name: 'クレベース (ヒスイのすがた)', kana: 'クレベース (ヒスイのすがた)' },
  { id: 715000, name: 'オンバーン', kana: 'オンバーン' },
  { id: 724000, name: 'ジュナイパー', kana: 'ジュナイパー' },
  { id: 724001, name: 'ジュナイパー (ヒスイのすがた)', kana: 'ジュナイパー (ヒスイのすがた)' },
  { id: 727000, name: 'ガオガエン', kana: 'ガオガエン' },
  { id: 730000, name: 'アシレーヌ', kana: 'アシレーヌ' },
  { id: 733000, name: 'ドデカバシ', kana: 'ドデカバシ' },
  { id: 740000, name: 'ケケンカニ', kana: 'ケケンカニ' },
  { id: 745000, name: 'ルガルガン (まひるのすがた)', kana: 'ルガルガン (まひるのすがた)' },
  { id: 745001, name: 'ルガルガン (まよなかのすがた)', kana: 'ルガルガン (まよなかのすがた)' },
  { id: 745002, name: 'ルガルガン (たそがれのすがた)', kana: 'ルガルガン (たそがれのすがた)' },
  { id: 748000, name: 'ドヒドイデ', kana: 'ドヒドイデ' },
  { id: 750000, name: 'バンバドロ', kana: 'バンバドロ' },
  { id: 752000, name: 'オニシズクモ', kana: 'オニシズクモ' },
  { id: 758000, name: 'エンニュート', kana: 'エンニュート' },
  { id: 763000, name: 'アマージョ', kana: 'アマージョ' },
  { id: 765000, name: 'ヤレユータン', kana: 'ヤレユータン' },
  { id: 766000, name: 'ナゲツケサル', kana: 'ナゲツケサル' },
  { id: 778000, name: 'ミミッキュ', kana: 'ミミッキュ' },
  { id: 780000, name: 'ジジーロン', kana: 'ジジーロン' },
  { id: 784000, name: 'ジャラランガ', kana: 'ジャラランガ' },
  { id: 823000, name: 'アーマーガア', kana: 'アーマーガア' },
  { id: 841000, name: 'アップリュー', kana: 'アップリュー' },
  { id: 842000, name: 'タルップル', kana: 'タルップル' },
  { id: 844000, name: 'サダイジャ', kana: 'サダイジャ' },
  { id: 855000, name: 'ポットデス', kana: 'ポットデス' },
  { id: 858000, name: 'ブリムオン', kana: 'ブリムオン' },
  { id: 866000, name: 'バリコオル', kana: 'バリコオル' },
  { id: 867000, name: 'デスバーン', kana: 'デスバーン' },
  { id: 869000, name: 'マホイップ', kana: 'マホイップ' },
  { id: 877000, name: 'モルペコ', kana: 'モルペコ' },
  { id: 887000, name: 'ドラパルト', kana: 'ドラパルト' },
  { id: 899000, name: 'アヤシシ', kana: 'アヤシシ' },
  { id: 900000, name: 'バサギリ', kana: 'バサギリ' },
  { id: 902000, name: 'イダイトウ (オスのすがた)', kana: 'イダイトウ (オスのすがた)' },
  { id: 902001, name: 'イダイトウ (メスのすがた)', kana: 'イダイトウ (メスのすがた)' },
  { id: 903000, name: 'オオニューラ', kana: 'オオニューラ' },
  { id: 908000, name: 'マスカーニャ', kana: 'マスカーニャ' },
  { id: 911000, name: 'ラウドボーン', kana: 'ラウドボーン' },
  { id: 914000, name: 'ウェーニバル', kana: 'ウェーニバル' },
  { id: 925000, name: 'イッカネズミ', kana: 'イッカネズミ' },
  { id: 934000, name: 'キョジオーン', kana: 'キョジオーン' },
  { id: 936000, name: 'グレンアルマ', kana: 'グレンアルマ' },
  { id: 937000, name: 'ソウブレイズ', kana: 'ソウブレイズ' },
  { id: 939000, name: 'ハラバリー', kana: 'ハラバリー' },
  { id: 952000, name: 'スコヴィラン', kana: 'スコヴィラン' },
  { id: 956000, name: 'クエスパトラ', kana: 'クエスパトラ' },
  { id: 959000, name: 'デカヌチャン', kana: 'デカヌチャン' },
  { id: 964000, name: 'イルカマン', kana: 'イルカマン' },
  { id: 968000, name: 'ミミズズ', kana: 'ミミズズ' },
  { id: 970000, name: 'キラフロル', kana: 'キラフロル' },
  { id: 981000, name: 'リキキリン', kana: 'リキキリン' },
  { id: 983000, name: 'ドドゲザン', kana: 'ドドゲザン' },
  { id: 1013000, name: 'ヤバソチャ', kana: 'ヤバソチャ' },
  { id: 1018000, name: 'ブリジュラス', kana: 'ブリジュラス' },
  { id: 1019000, name: 'カミツオロチ', kana: 'カミツオロチ' },
];

// 入力された「ひらがな」を「カタカナ」に変換する関数（検索のゆらぎ吸収用）
const hiraToKata = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
};

// ==========================================
// コンポーネント本体
// ==========================================

export default function NewBattlePage() {
  const router = useRouter();
  const initializeMatch = useBattleStore((state) => state.initializeMatch);
  
  // 選択された6匹のデータ (初期状態はnull)
  const [selectedPokemons, setSelectedPokemons] = useState<(typeof POKEMON_MASTER[0] | null)[]>([
    null, null, null, null, null, null
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 【コア機能】インクリメンタルサーチ
  // 入力文字(searchQuery)が変わるたびに爆速でフィルタリングを実行
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // ユーザーは「ひらがな」で入力する可能性が高いため、カタカナに正規化して検索
    const normalizedQuery = hiraToKata(searchQuery);
    
    return POKEMON_MASTER.filter(p => 
      p.kana.includes(normalizedQuery) || p.name.includes(searchQuery)
    ).slice(0, 10); // 画面に収まるよう上位10件で打ち切る（レンダリングの爆速化）
  }, [searchQuery]);

  // ポケモンをタップして選択した時の処理
  const handleSelectPokemon = (pokemon: typeof POKEMON_MASTER[0]) => {
    const emptyIndex = selectedPokemons.findIndex(p => p === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedPokemons];
      newSelected[emptyIndex] = pokemon;
      setSelectedPokemons(newSelected);
      setSearchQuery(''); // 🌟 連続で入力できるよう検索バーを即座にリセット
    }
  };

  // 選択済みポケモンをタップして解除（取り消し）する処理
  const handleRemovePokemon = (indexToRemove: number) => {
    const newSelected = [...selectedPokemons];
    newSelected[indexToRemove] = null;
    setSelectedPokemons(newSelected);
  };

  // 対戦開始ボタン押下時の処理
  const handleStartBattle = async () => {
    if (selectedPokemons.includes(null)) return;
    setIsSubmitting(true);

    try {
      const initialPokemons = selectedPokemons.map((p, index) => ({
        base_pokemon_id: p!.id,
        slot_order: index + 1,
        is_selected: false,
        is_fainted: false,
        is_tera_used: false,
        is_mega_used: false,
        tera_type: null,
        item_id: null,
        ability_id: null,
        moves: [],
      }));

      // 🌟 ダミーを削除し、FastAPIへPOSTリクエストを送信
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/battles/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Phase1は認証なしのため、ダミーのUUID(ご自身のDBの都合の良いUUID)を入れます
          user_id: "00000000-0000-0000-0000-000000000000", 
          opponent_team: initialPokemons
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔥バックエンドからのエラー詳細:", response.status, errorText);
        throw new Error(`Failed to create battle: ${response.status}`);
      }
      
      const data = await response.json();

      // Storeを初期化してメイン画面へ遷移
      initializeMatch(data.id, data.opponent_pokemons);
      router.push(`/battle/${data.id}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">相手のパーティを入力</h1>

      {/* 選択された6匹のスロット */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {selectedPokemons.map((p, index) => (
          <div 
            key={index} 
            onClick={() => p && handleRemovePokemon(index)}
            className={`
              aspect-square rounded-lg flex flex-col items-center justify-center border transition-all
              ${p ? 'bg-gray-700 border-blue-500 cursor-pointer hover:bg-gray-600' : 'bg-gray-800 border-gray-700'}
            `}
          >
            {p ? (
              <>
                <span className="text-xs text-gray-400 mb-1">枠 {index + 1}</span>
                <span className="text-sm font-bold text-center leading-tight px-1">{p.name}</span>
                {/* ここに img タグ等でアイコンを表示すると更に良くなります */}
              </>
            ) : (
              <span className="text-gray-500 text-sm">枠 {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* 検索・サジェストエリア */}
      <div className="flex-1 bg-gray-800 rounded-t-2xl p-4 -mx-4 mt-auto border-t border-gray-700">
        <input
          type="text"
          placeholder="ひらがなで検索 (例: かい...)"
          className="w-full bg-gray-900 text-white rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        
        {/* 検索結果のリスト */}
        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[40vh] pb-4">
          {searchResults.map((p) => (
            <button
              key={p.id}
              className="bg-gray-700 border border-gray-600 px-4 py-2 rounded-full text-sm active:bg-blue-600 active:border-blue-500 transition-colors"
              onClick={() => handleSelectPokemon(p)}
            >
              {p.name}
            </button>
          ))}
          
          {searchQuery && searchResults.length === 0 && (
            <p className="text-gray-400 text-sm p-2">見つかりませんでした</p>
          )}
        </div>
      </div>

      {/* 開始ボタン */}
      <div className="pt-4 pb-2 bg-gray-900 -mx-4 px-4 border-t border-gray-800">
        <button
          onClick={handleStartBattle}
          disabled={selectedPokemons.includes(null) || isSubmitting}
          className="w-full bg-blue-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? '準備中...' : '対戦開始 (90秒)'}
        </button>
      </div>
    </div>
  );
}