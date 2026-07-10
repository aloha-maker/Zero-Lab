// frontend/features/parties/hooks/usePartyForm.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PartyResponse, PartyMember, PartyCreateRequest } from '../types';
import type { PokemonBuildResponse } from '@/features/bulids/types';
import { getBuilds } from '@/features/bulids/api/getBuilds';
import { saveParty } from '../api/saveParty';

export const usePartyForm = (
    initialData?: PartyResponse, 
    isEdit?: boolean,
    onSuccess?: (savedData?: any) => void 
) => {
    const router = useRouter();
    
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedBuilds, setSelectedBuilds] = useState<(string | null)[]>(() => {
        const mList: PartyMember[] = initialData?.members || (initialData as any)?.party_members || [];
        return Array(6).fill(null).map((_, i) => {
            const slotNumber = i + 1;
            const found = mList.find((m) => m.slot_index === slotNumber);
            return found ? found.build_id : null;
        });
    });

    const [availableBuilds, setAvailableBuilds] = useState<PokemonBuildResponse[]>([]);
    const [isLoadingBuilds, setIsLoadingBuilds] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchBuilds = async () => {
            try {
                const res = await getBuilds();
                if (isMounted) setAvailableBuilds(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) setIsLoadingBuilds(false);
            }
        };
        fetchBuilds();
        
        return () => { isMounted = false; };
    }, []);

    const handleBuildSelect = (index: number, value: string) => {
        const newSelected = [...selectedBuilds];
        newSelected[index] = value || null;
        setSelectedBuilds(newSelected);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const members: PartyMember[] = selectedBuilds
            .map((id, index) => (id ? { build_id: id, slot_index: index + 1 } : null))
            .filter((m): m is PartyMember => m !== null);

        const payload: PartyCreateRequest = { name, description, members };

        try {
            // ★ 変更: APIのレスポンスを受け取る
            const res = await saveParty(payload, initialData?.id, isEdit);
            
            if (onSuccess) {
                // ★ onSuccessが渡されている場合はリダイレクトせずコールバックを実行
                onSuccess(res);
            } else {
                // 渡されていない場合（他の画面で使っている場合など）は従来通りリダイレクト
                router.push('/parties');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return {
        name,
        setName,
        description,
        setDescription,
        selectedBuilds,
        handleBuildSelect,
        availableBuilds,
        isLoadingBuilds,
        isSaving,
        handleSave,
        handleCancel
    };
};