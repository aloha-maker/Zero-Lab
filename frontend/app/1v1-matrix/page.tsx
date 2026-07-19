"use client";

import React from "react";
import { useOneVsOneMatrix } from "@/features/1v1-matrix/hooks/useOneVsOneMatrix";
import { OneVsOneForm } from "@/features/1v1-matrix/components/OneVsOneForm";
import { OneVsOneResult } from "@/features/1v1-matrix/components/OneVsOneResult";

export default function OneVsOneMatrixPage() {
  const {
    requestData,
    result,
    loading,
    error,
    handleEvChange,
    handleInputChange,
    executeSimulation,
  } = useOneVsOneMatrix();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">1vs1 対面シミュレータ</h1>
      
      <OneVsOneForm
        requestData={requestData}
        loading={loading}
        onInputChange={handleInputChange}
        onEvChange={handleEvChange}
        onSubmit={executeSimulation}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}

      {result && <OneVsOneResult result={result} />}
    </main>
  );
}