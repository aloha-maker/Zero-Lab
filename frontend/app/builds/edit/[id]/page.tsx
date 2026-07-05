import { use } from "react";
import { BuildForm } from "@/features/bulids/components/BuildForm";

interface EditBuildPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBuildPage({ params }: EditBuildPageProps) {
    const { id } = use(params);

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-slate-800 border-b-2 border-indigo-500 pb-2">
                ポケモンの調整変更
            </h1>
            {/* URLから取得したidを渡すことで編集モードに自動切り替え */}
            <BuildForm id={id} />
        </div>
    );
}