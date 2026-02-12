
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Loader2, FileText, CheckSquare, User, Download, Play, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type InterviewCase = {
    id: string;
    title: string;
    jobCategory: string;
    interviewFormat: string;
    status: string;
    questionSheet: string | null;
    evaluationSheet: string | null;
    candidateReport: string | null;
};

export default function InterviewCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [interviewCase, setInterviewCase] = useState<InterviewCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'questions' | 'evaluation' | 'report'>('questions');
    const [id, setId] = useState<string>('');

    useEffect(() => {
        params.then((p) => {
            setId(p.id);
            fetchCase(p.id);
        });
    }, [params]);

    const fetchCase = async (caseId: string) => {
        try {
            const res = await fetch(`/api/interview-prep/${caseId}`);
            if (res.ok) {
                const data = await res.json();
                setInterviewCase(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!interviewCase) return;
        setGenerating(true);
        try {
            const res = await fetch(`/api/interview-prep/${interviewCase.id}/generate`, {
                method: 'POST',
            });
            if (res.ok) {
                await fetchCase(interviewCase.id);
            } else {
                alert('生成に失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!interviewCase) return <div className="p-12 text-center">案件が見つかりません</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-6">
                <Link href="/interview-prep" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    一覧に戻る
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {interviewCase.title}
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border
                  ${interviewCase.status === 'ready' ? 'bg-green-50 text-green-700 border-green-200' :
                                    interviewCase.status === 'generating' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {interviewCase.status === 'ready' ? '準備完了' :
                                    interviewCase.status === 'generating' ? '生成中...' : '下書き'}
                            </span>
                        </h1>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {interviewCase.jobCategory}</span>
                            <span className="flex items-center"><CheckSquare className="w-4 h-4 mr-1" /> {interviewCase.interviewFormat}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {interviewCase.status === 'draft' && (
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                            >
                                {generating ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Play className="-ml-1 mr-2 h-4 w-4" />}
                                AI生成を開始
                            </button>
                        )}
                        {interviewCase.status === 'ready' && (
                            <button
                                onClick={() => alert('PDFダウンロード機能は実装中です')} // TODO: Implement PDF download
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <Download className="-ml-1 mr-2 h-4 w-4" />
                                PDFダウンロード
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            {interviewCase.status === 'ready' ? (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('questions')}
                                className={`${activeTab === 'questions' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                質問シート
                            </button>
                            <button
                                onClick={() => setActiveTab('evaluation')}
                                className={`${activeTab === 'evaluation' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
                            >
                                <CheckSquare className="w-4 h-4 mr-2" />
                                評価シート
                            </button>
                            <button
                                onClick={() => setActiveTab('report')}
                                className={`${activeTab === 'report' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
                            >
                                <User className="w-4 h-4 mr-2" />
                                候補者レポート
                            </button>
                        </nav>
                    </div>

                    <div className="p-6 bg-gray-50 min-h-[500px]">
                        <div className="bg-white p-8 rounded shadow-sm border border-gray-200 prose prose-sm max-w-none">
                            {activeTab === 'questions' && (
                                <pre className="whitespace-pre-wrap font-sans">{interviewCase.questionSheet}</pre>
                            )}
                            {activeTab === 'evaluation' && (
                                <pre className="whitespace-pre-wrap font-sans">{interviewCase.evaluationSheet}</pre>
                            )}
                            {activeTab === 'report' && (
                                <pre className="whitespace-pre-wrap font-sans">{interviewCase.candidateReport}</pre>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow sm:rounded-lg p-12 text-center">
                    {generating ? (
                        <div className="py-12">
                            <Loader2 className="animate-spin text-brand-600 w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">AIが面接準備セットを生成中...</h3>
                            <p className="text-gray-500 mt-2">これには1〜2分かかる場合があります。求人票と履歴書を分析しています。</p>
                        </div>
                    ) : (
                        <div className="py-12">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <Play className="h-6 w-6 text-brand-600 ml-1" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">まだ生成されていません</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">右上の「AI生成を開始」ボタンを押すと、この候補専用の質問リストと評価シートを作成します。</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
