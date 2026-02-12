import { NextRequest, NextResponse } from 'next/server';
import { parseExcelBuffer } from '@/lib/slide-forge/excelParser';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'ファイルが選択されていません' },
                { status: 400 }
            );
        }

        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            return NextResponse.json(
                { success: false, error: 'Excelファイル(.xlsx)を選択してください' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const parsed = parseExcelBuffer(buffer, file.name);

        return NextResponse.json({ success: true, data: parsed });
    } catch (error) {
        console.error('Excel parse error:', error);
        return NextResponse.json(
            { success: false, error: 'Excelファイルの解析に失敗しました' },
            { status: 500 }
        );
    }
}
