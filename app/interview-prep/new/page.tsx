

import InterviewCaseForm from '@/components/interview/InterviewCaseForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInterviewCasePage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <div className="mb-6">
                <Link href="/interview-prep" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    一覧に戻る
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">新規面接準備セット作成</h1>
                <p className="mt-1 text-sm text-gray-500">求人票と履歴書から、最適な質問リストと評価シートを生成します。</p>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <InterviewCaseForm />
                </div>
            </div>
        </div>
    );
}
