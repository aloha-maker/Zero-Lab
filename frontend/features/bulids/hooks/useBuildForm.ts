import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";
import type { BuildCreateRequest, BuildUpdateRequest, PokemonBuildResponse } from "@/app/types/api";

interface UseBuildFormProps {
    id?: string;
}

export const useBuildForm = ({ id }: UseBuildFormProps = {}) => {
    const router = useRouter();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState<BuildCreateRequest | BuildUpdateRequest>({
        pokemon_id: 0,
        pokemon_name: "",
        nickname: "",
        nature: "",
        ability: "",
        item: "",
        tera_type: "",
        moves: ["", "", "", ""],
        evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
        ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        memo: ""
    });

    // StatFormの初期化に必要なポケモンの名前を管理
    const [initialPokemonName, setInitialPokemonName] = useState<string>("");

    // 編集モードの場合のみ初期データを取得
    useEffect(() => {
        if (!id) return;

        const fetchBuild = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get<PokemonBuildResponse>(`/api/v1/builds/${id}`);
                
                setFormData({
                    pokemon_id: data.pokemon_id,
                    pokemon_name: data.pokemon_name,
                    nickname: data.nickname || "",
                    nature: data.nature || "",
                    ability: data.ability || "",
                    item: data.item || "",
                    tera_type: data.tera_type || "",
                    moves: data.moves || ["", "", "", ""],
                    evs: data.evs,
                    ivs: data.ivs || { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
                    memo: data.memo || ""
                });
                setInitialPokemonName(data.pokemon_name);
            } catch (err: unknown) {
                console.error("データ取得エラー:", err);
                setErrorMsg("データの読み込みに失敗しました。");
            } finally {
                setLoading(false);
            }
        };

        fetchBuild();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMoveChange = (index: number, value: string) => {
        setFormData(prev => {
            const newMoves = [...prev.moves];
            newMoves[index] = value;
            return { ...prev, moves: newMoves };
        });
    };

    // StatFormコンポーネントの型定義に完全に一致させた安全なハンドラー
    const handleStatusUpdate = useCallback((update: { 
        pokemon_id?: number; 
        pokemon_name?: string; 
        nature?: string; 
        evs: { H: number; A: number; B: number; C: number; D: number; S: number; } 
    }) => {
        setFormData(prev => ({
            ...prev,
            pokemon_id: update.pokemon_id ?? prev.pokemon_id,
            pokemon_name: update.pokemon_name ?? prev.pokemon_name,
            nature: update.nature ?? prev.nature,
            evs: update.evs
        }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg(null);

        try {
            if (isEditMode && id) {
                // 編集時は PUT
                await apiClient.put(`/api/v1/builds/${id}`, formData);
                alert("変更を保存しました！");
            } else {
                // 新規登録時は POST
                await apiClient.post("/api/v1/builds/", formData);
                alert("新規登録しました！");
            }
            router.push("/builds");
            router.refresh();
        } catch (error: unknown) {
            console.error("保存エラー:", error);
            if (error instanceof ApiError) {
                setErrorMsg(error.message);
            } else {
                setErrorMsg("通信エラーが発生しました");
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        isEditMode,
        formData,
        loading,
        saving,
        errorMsg,
        initialPokemonName,
        handleChange,
        handleMoveChange,
        handleStatusUpdate,
        handleSubmit
    };
};