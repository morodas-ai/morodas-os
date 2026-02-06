"use client";

import { Brain, Upload, FileText, Search } from "lucide-react";

export default function KnowledgePage() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-50">ナレッジベース</h1>

            {/* 概要 */}
            <section className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-slate-700 p-3 rounded-lg text-emerald-500">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-50">エージェントの学習データ</h2>
                        <p className="text-slate-400 text-sm">ドキュメントやデータをアップロードして、エージェントをカスタマイズ</p>
                    </div>
                </div>
            </section>

            {/* アップロードエリア */}
            <section className="bg-slate-800 rounded-xl p-8 border border-dashed border-slate-600 mb-8 text-center">
                <Upload size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-50 mb-2">ファイルをドラッグ&ドロップ</h3>
                <p className="text-slate-400 text-sm mb-4">PDF, Word, テキストファイル対応</p>
                <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    ファイルを選択
                </button>
            </section>

            {/* アップロード済みドキュメント */}
            <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-50">アップロード済みドキュメント</h2>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="検索..."
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-50 focus:outline-none focus:border-emerald-500 w-64"
                        />
                    </div>
                </div>

                {/* 空状態 */}
                <div className="p-8 text-center">
                    <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">まだドキュメントがありません</p>
                    <p className="text-slate-500 text-sm mt-1">ファイルをアップロードして、エージェントに学習させましょう</p>
                </div>
            </section>
        </div>
    );
}
