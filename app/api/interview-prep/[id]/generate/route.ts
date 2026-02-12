
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. 案件データ取得
        const interviewCase = await prisma.interviewCase.findUnique({
            where: { id },
        });

        if (!interviewCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        // 2. ステータスを generating に更新
        await prisma.interviewCase.update({
            where: { id },
            data: { status: 'generating' },
        });

        // 3. Gemini API 呼び出し
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        const systemPrompt = `あなたは中小企業の採用面接を支援する「面接準備AI」です。
構造化面接の研究知見に基づき、面接官（社長・部門長）が候補者を正確に評価するための
質問シート・評価基準・候補者分析レポートを生成します。

## あなたの原則
1. **構造化面接**: 全候補者に同じ構造の質問を使い、主観バイアスを排除する
2. **行動ベース評価**: 「何を言うか」ではなく「過去に何をしたか」を重視する（STAR形式）
3. **実用性最優先**: 面接経験が少ない社長でも5分で読んで使えるレベルに簡潔にする
4. **日本語**: 全出力は自然な日本語で。敬語は使わず、ですます調で統一する`;

        const userPrompt = `以下の情報をもとに、この候補者専用の面接準備セットを生成してください。

---

## INPUT

### 求人票
${interviewCase.jobPosting}

### 履歴書・職務経歴書
${interviewCase.resume}

### 自社の「求める人物像」メモ
${interviewCase.personaNote || 'なし（求人票から推定してください）'}

### 職種カテゴリ
${interviewCase.jobCategory}

### 面接形式
${interviewCase.interviewFormat}

---

## OUTPUT指示

以下の3つのドキュメントを生成してください。
各セクションは必ず "### ①", "### ②", "### ③" で開始してください。によりプログラムが分割します。

### ① 構造化面接 質問シート
（内容はPrompt 1の定義に従う。Markdown形式。）

### ② 評価シート
（内容はPrompt 1の定義に従う。Markdown形式。）

### ③ 候補者レポート
（内容はPrompt 1の定義に従う。Markdown形式。）
`;

        const result = await model.generateContent([
            systemPrompt,
            "\n\n---\n\n",
            userPrompt
        ]);
        const response = await result.response;
        const fullText = response.text();

        // 4. レスポンスのパース (簡易的な分割ロジック)
        // "### ①", "### ②", "### ③" で分割する
        const sections = fullText.split(/### [①②③]/);

        // sections[0] は冒頭の空文字やイントロなど
        // sections[1] = 質問シート
        // sections[2] = 評価シート
        // sections[3] = 候補者レポート

        const questionSheet = sections[1] ? `## 構造化面接 質問シート\n${sections[1].trim()}` : fullText; // 分割失敗時は全文入れる
        const evaluationSheet = sections[2] ? `## 評価シート\n${sections[2].trim()}` : '';
        const candidateReport = sections[3] ? `## 候補者レポート\n${sections[3].trim()}` : '';

        // 5. データ保存 & ステータス完了
        const updatedCase = await prisma.interviewCase.update({
            where: { id },
            data: {
                status: 'ready',
                questionSheet,
                evaluationSheet,
                candidateReport,
            },
        });

        // 6. n8n Webhook Trigger (Optional)
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            try {
                await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: updatedCase.id,
                        title: updatedCase.title,
                        jobCategory: updatedCase.jobCategory,
                        status: updatedCase.status,
                        generatedAt: new Date().toISOString(),
                    }),
                });
                console.log('Triggered n8n webhook successfully');
            } catch (webhookError) {
                console.error('Failed to trigger n8n webhook:', webhookError);
                // Webhook failure should not fail the AP response
            }
        }

        return NextResponse.json(updatedCase);

    } catch (error) {
        console.error('Error generating interview prep:', error);

        return NextResponse.json(
            { error: 'Failed to generate' },
            { status: 500 }
        );
    }
}
