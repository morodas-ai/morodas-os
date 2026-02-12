
import Link from 'next/link';
import { Calendar, Briefcase, FileText, CheckCircle, Loader2 } from 'lucide-react';

type InterviewCase = {
    id: string;
    title: string;
    jobCategory: string;
    status: string;
    createdAt: string;
};

export default function InterviewCaseCard({ interviewCase }: { interviewCase: InterviewCase }) {
    const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        generating: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        evaluated: 'bg-purple-100 text-purple-800',
    };

    const statusLabels = {
        draft: '下書き',
        generating: '生成中',
        ready: '準備完了',
        evaluated: '面接終了',
    };

    return (
        <Link href={`/interview-prep/${interviewCase.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[interviewCase.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[interviewCase.status as keyof typeof statusLabels] || interviewCase.status}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(interviewCase.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{interviewCase.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Briefcase className="w-4 h-4 mr-1.5" />
                        {interviewCase.jobCategory}
                    </div>
                </div>

                <div className="flex items-center text-sm font-medium text-brand-600 mt-2">
                    詳細を見る <span className="ml-1">→</span>
                </div>
            </div>
        </Link>
    );
}
