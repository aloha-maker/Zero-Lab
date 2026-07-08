// frontend/features/bulids/hooks/useTrainedList.ts

import { useState, useEffect, useCallback } from "react";
import { getBuilds } from "../api/getBuilds";
import { deleteBuild } from "../api/deleteBuild";
import type { PokemonBuildResponse } from "../types";

export const useTrainedList = () => {
    const [builds, setBuilds] = useState<PokemonBuildResponse[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchBuilds = useCallback(async () => {
        setErrorMsg(null);
        try {
            const res = await getBuilds();
            if (res.status === "success") {
                setBuilds(res.data);
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
            await deleteBuild(id);
            fetchBuilds(); // 成功したら再取得
        } catch (error: any) {
            alert(error.message || "削除に失敗しました");
        }
    };

    return {
        builds,
        errorMsg,
        handleDelete,
    };
};