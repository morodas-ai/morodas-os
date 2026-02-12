
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';

export default function InterviewCaseForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        jobPosting: '',
        resume: '',
        personaNote: '',
        jobCategory: '営業',
        interviewFormat: '対面',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/interview-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create case');

            const data = await response.json();
            router.push(`/interview-prep/${data.id}`);
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 z-10 
              ${step >= s ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {s}
                        </div>
                        <span className={`text-xs ${step >= s ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>
                            {s === 1 ? '求人情報' : s === 2 ? '候補者情報' : '詳細設定'}
                        </span>
                        {s < 3 && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 
                ${step > s ? 'bg-brand-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: 求人情報 */}
            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">案件名 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="例: 営業マネージャー採用 - 田中太郎"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">求人票テキスト <span className="text-red-500">*</span></label>
                        <textarea
                            name="jobPosting"
                            value={formData.jobPosting}
                            onChange={handleChange}
                            rows={10}
                            placeholder="求人票の内容をここに貼り付けてください..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 font-mono text-sm"
                            required
                        />
                    </div>
                </div>
            )}

            {/* Step 2: 候補者情報 */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">履歴書・職務経歴書テキスト <span className="text-red-500">*</span></label>
                        <div className="bg-blue-50 p-4 rounded-md mb-2 text-sm text-blue-800">
                            💡 今後のアップデートでPDFアップロードに対応予定です。現在はテキストを貼り付けてください。
                        </div>
                        <textarea
                            name="resume"
                            value={formData.resume}
                            onChange={handleChange}
                            rows={15}
                            placeholder="履歴書・職務経歴書の内容をここに貼り付けてください..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 font-mono text-sm"
                            required
                        />
                    </div>
                </div>
            )}

            {/* Step 3: 詳細設定 */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">職種カテゴリ <span className="text-red-500">*</span></label>
                        <select
                            name="jobCategory"
                            value={formData.jobCategory}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="営業">営業</option>
                            <option value="事務">事務</option>
                            <option value="エンジニア">エンジニア</option>
                            <option value="現場作業">現場作業</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">面接形式 <span className="text-red-500">*</span></label>
                        <select
                            name="interviewFormat"
                            value={formData.interviewFormat}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="対面">対面</option>
                            <option value="オンライン">オンライン</option>
                            <option value="1回のみ">1回のみ</option>
                            <option value="2回（1次+最終）">2回（1次+最終）</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">「求める人物像」メモ（任意）</label>
                        <textarea
                            name="personaNote"
                            value={formData.personaNote}
                            onChange={handleChange}
                            rows={4}
                            placeholder="特に重視したいポイントや、チームのカルチャーなどがあれば記入してください..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        />
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                    >
                        戻る
                    </button>
                ) : (
                    <div></div> // Spacer
                )}

                {step < 3 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={
                            (step === 1 && (!formData.title || !formData.jobPosting)) ||
                            (step === 2 && !formData.resume)
                        }
                        className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        次へ
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                        作成する
                    </button>
                )}
            </div>
        </form>
    );
}
