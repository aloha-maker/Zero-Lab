import PokemonConfigSection from "./components/PokemonConfigSection";
import MatchupMatrixSection from "./components/MatchupMatrixSection";

export default function Step1Screen() {
  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      {/* 主軸設定セクション */}
      <PokemonConfigSection />

      {/* マトリクス相性表セクション */}
      <MatchupMatrixSection />
    </section>
  );
}