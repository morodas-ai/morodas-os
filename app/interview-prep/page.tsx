
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import InterviewCaseCard from '@/components/interview/InterviewCaseCard';


type InterviewCase = {
    id: string;
    title: string;
    jobCategory: string;
    status: string;
    createdAt: string;
};

export default function InterviewPrepPage() {
    const [cases, setCases] = useState<InterviewCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCases() {
            try {
                const res = await fetch('/api/interview-prep');
                if (res.ok) {
                    const data = await res.json();
                    setCases(data);
                }
            } catch (error) {
                console.error('Failed to fetch cases:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">面接準備AI</h1>
                    <p className="mt-1 text-sm text-gray-500">社長のための「AI面接コーチ」。質問シートと評価基準を自動生成します。</p>
                </div>
                <Link
                    href="/interview-prep/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    新規作成
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-brand-600 w-8 h-8" />
                </div>
            ) : cases.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">案件がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">「新規作成」ボタンから、求人票と履歴書を登録してください。</p>
                    <div className="mt-6">
                        <Link
                            href="/interview-prep/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            新規作成
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cases.map((c) => (
                        <InterviewCaseCard key={c.id} interviewCase={c} />
                    ))}
                </div>
            )}
        </div>
    );
}
