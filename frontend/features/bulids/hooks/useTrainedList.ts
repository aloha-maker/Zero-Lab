import { useState, useEffect, useCallback } from "react";
import { API_URL,ApiErrorResponse } from "@/lib/api-client";
import type { PokemonBuildResponse } from "../types";

export const useTrainedList = () => {
    const [builds, setBuilds] = useState<PokemonBuildResponse[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchBuilds = useCallback(async () => {
        setErrorMsg(null);
        try {
            const res = await fetch(`${API_URL}/api/v1/builds`);

            if (!res.ok) {
                throw new Error("データの取得に失敗しました");
            }

            const json = await res.json();
            if (json.status === "success") {
                setBuilds(json.data);
            } else {
                setBuilds([]);
            }
        } catch (error: any) {
            console.error("データの取得に失敗しました", error);
            setErrorMsg(error.message || "通信エラーが発生しました");
            setBuilds([]);
        }
    }, []);

    useEffect(() => {
        fetchBuilds();
    }, [fetchBuilds]);

    const handleDelete = async (id: string) => {
        if (!confirm("削除しますか？")) return;

        try {
            const res = await fetch(`${API_URL}/api/v1/builds/${id}`, { method: "DELETE" });

            if (!res.ok) {
                const errorData = (await res.json()) as ApiErrorResponse;
                let errorMessage = "削除に失敗しました";
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                }
                throw new Error(errorMessage);
            }

            fetchBuilds(); // 成功したら再取得
        } catch (error: any) {
            alert(error.message);
        }
    };

    return {
        builds,
        errorMsg,
        handleDelete,
    };
};