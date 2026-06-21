// import React, { useState } from 'react';
// import { MatrixResultRow } from '@/app/types/api';
// import Phase1TargetList from './components/step2/Phase1TargetList';
// import Phase2ScreeningTrigger from './components/step2/Phase2ScreeningTrigger';
// import Phase3MatchupMatrix from './components/step2/Phase3MatchupMatrix';
// import Phase4RoleChecker from './components/step2/Phase4RoleChecker';
// import { PokemonCandidate } from './components/step2/types';

// interface Step3PageProps {
//   prop1: string
// }

// export const Step2Page: React.FC<Step3PageProps> = ({ prop1 }) => {
//   // 主軸ポケモンの設定状態
//   const [mainPokemon, setMainPokemon] = useState<ConfiguredMainPokemon | null>(null);
//   return (
//     <div className="space-y-8 max-w-7xl mx-auto p-4">
//       {/* 1. ポケモン設定セクション */}
//       <PokemonConfigSection 
//         selectedPokemon={mainPokemon}
//         onPokemonConfigComplete={(data) => setMainPokemon(data)}
//       />

//       {/* 2. 有利不利マトリクスセクション */}
//       {mainPokemon && (
//         <MatchupMatrixSection 
//           mainPokemonName={mainPokemon.name}
//           selectedNatureName={mainPokemon.nature.name}
//           evs={mainPokemon.evs}
//           onMatrixCalculated={onMatrixCalculated}
//           initialMatrixData={matrixData}
//         />
//       )}

//       {/* 3. 戦術アーキタイプ判定セクション */}
//       {mainPokemon && matrixData.length > 0 && (
//         <ArchetypeDeterminationSection 
//           mainPokemonName={mainPokemon.name}
//           tags={mainPokemon.tags || []} 
//           matrixData={matrixData}
//         />
//       )}
//     </div>
//   );
// };