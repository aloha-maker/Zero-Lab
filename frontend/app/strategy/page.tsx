"use client";

import { useState } from "react";
import type { TabId } from "./types";
import { MatrixResultRow } from "@/app/types/api"; 

import StrategyLayout from "./components/StrategyLayout";
import Step1Screen from "./screens/Step1Screen";
import Step2Screen from "./screens/Step2Screen";
import Step5Screen from "./screens/Step5Screen";
import Step6Screen from "./screens/Step6Screen";

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("step1");
  
  // ★Step1の計算結果を保持し、Step2でも利用するための共通State
  const [matrixData, setMatrixData] = useState<MatrixResultRow[]>([]);

  return (
    <StrategyLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* matrixData と 更新関数を渡す */}
      {activeTab === "step1" && (
        <Step1Screen 
          matrixData={matrixData} 
          onMatrixCalculated={setMatrixData} 
        />
      )}
      
      {/* 保存された matrixData をそのまま流し込む */}
      {activeTab === "step2" && (
        <Step2Screen matrixData={matrixData} />
      )}
      
      {activeTab === "step5" && <Step5Screen />}
      {activeTab === "step6" && <Step6Screen />}
    </StrategyLayout>
  );
}