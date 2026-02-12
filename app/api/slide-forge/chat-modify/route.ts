import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SlideData, GenerationConfig } from '@/lib/slide-forge/types';
import { generateSlideSVG } from '@/lib/slide-forge/svgEngine';
import { getTheme } from '@/lib/slide-forge/themes';

export const maxDuration = 60;

function getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    return new GoogleGenAI({ apiKey });
}

export async function POST(request: NextRequest) {
    try {
        const { message, slides, config } = await request.json();

        if (!message || !slides || !config) {
            return NextResponse.json(
                { success: false, error: '必要なデータが不足しています' },
                { status: 400 }
            );
        }

        const client = getClient();

        // Build prompt for AI chat modification
        const slidesJson = JSON.stringify(slides, null, 2);
        const prompt = `あなたはプレゼンテーションスライドの編集アシスタントです。

ユーザーの指示に基づいて、以下のスライドデータを修正してください。

## 現在のスライドデータ (JSON)
\`\`\`json
${slidesJson}
\`\`\`

## ユーザーの修正指示
${message}

## ルール
1. 指示に関連するスライドのみ修正する
2. 指定がなければ他のスライドはそのまま
3. JSONの構造（type, index, title, bullets, notes等のフィールド）は変更しない
4. typeとして有効なのは: title, agenda, content, two-column, comparison, chart, image-text, summary
5. 修正後のスライドデータ全体をJSON配列で返す
6. JSONのみを返す。説明文は不要

修正後のスライドデータ (JSON配列):`;

        const modelName = config.aiModel === 'gemini-2.0-flash'
            ? 'gemini-2.0-flash'
            : config.aiModel === 'gemini-2.5-pro'
                ? 'gemini-2.5-pro-preview-05-06'
                : 'gemini-2.5-flash-preview-04-17';

        const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            },
        });

        const responseText = response.text || '';
        let modifiedSlides: SlideData[];

        try {
            modifiedSlides = JSON.parse(responseText);
            if (!Array.isArray(modifiedSlides)) {
                throw new Error('Response is not an array');
            }
        } catch {
            // Try to extract JSON from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                modifiedSlides = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('AIからの応答をパースできませんでした');
            }
        }

        // Regenerate SVGs for modified slides
        const theme = getTheme(config.themeName || 'corporate-blue', config.complexity);
        const newSvgs = modifiedSlides.map((slide: SlideData) =>
            generateSlideSVG(slide, theme, modifiedSlides.length)
        );

        // Generate a summary of what was changed
        const changeCount = modifiedSlides.filter((s: SlideData, i: number) => {
            if (i >= slides.length) return true;
            return JSON.stringify(s) !== JSON.stringify(slides[i]);
        }).length;

        return NextResponse.json({
            success: true,
            slides: modifiedSlides,
            svgs: newSvgs,
            summary: `${changeCount}枚のスライドを修正しました`,
        });
    } catch (error) {
        console.error('Chat modify error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'チャットによる修正に失敗しました',
            },
            { status: 500 }
        );
    }
}
