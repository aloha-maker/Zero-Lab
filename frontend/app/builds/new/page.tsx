import { BuildForm } from "@/features/bulids/components/BuildForm";

export default function NewBuildPage() {
    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-slate-800 border-b-2 border-indigo-500 pb-2">
                ポケモンの新規登録
            </h1>
            {/* idを指定しなければ新規作成モード */}
            <BuildForm />
        </div>
    );
}