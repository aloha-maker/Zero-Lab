"use client";

import { useState } from "react";

import type { TabId } from "./types";

import StrategyLayout from "./components/StrategyLayout";

import Step1Screen from "./screens/Step1Screen";
import Step2Screen from "./screens/Step2Screen";
import Step5Screen from "./screens/Step5Screen";
import Step6Screen from "./screens/Step6Screen";

export default function StrategyPage() {
  const [activeTab, setActiveTab] =
    useState<TabId>("step1");

  return (
    <StrategyLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === "step1" && <Step1Screen />}
      {activeTab === "step2" && <Step2Screen />}
      {activeTab === "step5" && <Step5Screen />}
      {activeTab === "step6" && <Step6Screen />}
    </StrategyLayout>
  );
}