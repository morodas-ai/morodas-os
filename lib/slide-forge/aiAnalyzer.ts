import { GoogleGenAI } from '@google/genai';
import { ParsedExcel, SlideData, GenerationConfig } from './types';
import { buildTemplatePromptSection } from './templateCatalog';

/**
 * Create client using the unified @google/genai SDK
 * This works for all models via the standard Gemini API
 */
function getClient(): GoogleGenAI {
    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
    });
}

/**
 * Analyze Excel data with Gemini and generate slide structure
 */
export async function analyzeAndGenerateSlides(
    excelData: ParsedExcel,
    config: GenerationConfig,
    referenceImageDescriptions?: string[]
): Promise<SlideData[]> {
    if (config.mode === 'split') {
        return splitMode(excelData, config);
    }
    return expandMode(excelData, config, referenceImageDescriptions);
}

/**
 * Split mode — divide data across slides with minimal AI processing
 */
function splitMode(excelData: ParsedExcel, config: GenerationConfig): SlideData[] {
    const slides: SlideData[] = [];
    const { pageCount } = config;

    const titleFromFileName = excelData.fileName.replace(/\.(xlsx|xls|csv)$/i, '');
    slides.push({
        index: 0,
        type: 'title',
        title: titleFromFileName,
        subtitle: `全${excelData.sheets.length}シート・${excelData.sheets.reduce((a, s) => a + s.rowCount, 0)}行のデータ`,
    });

    const contentSlideCount = pageCount - 2;
    const allRows: { sheet: string; headers: string[]; row: Record<string, string | number | boolean | null> }[] = [];

    for (const sheet of excelData.sheets) {
        for (const row of sheet.rows) {
            allRows.push({ sheet: sheet.name, headers: sheet.headers, row });
        }
    }

    const rowsPerSlide = Math.ceil(allRows.length / contentSlideCount);

    for (let i = 0; i < contentSlideCount && i * rowsPerSlide < allRows.length; i++) {
        const chunk = allRows.slice(i * rowsPerSlide, (i + 1) * rowsPerSlide);
        const firstRow = chunk[0];
        const bullets = chunk.map((r) =>
            firstRow.headers
                .slice(0, 3)
                .map((h) => `${h}: ${r.row[h] ?? '-'}`)
                .join(' / ')
        );

        slides.push({
            index: slides.length,
            type: 'content',
            title: `データ ${i + 1}`,
            bullets: bullets.slice(0, 8),
        });
    }

    slides.push({
        index: slides.length,
        type: 'summary',
        title: 'まとめ',
        bullets: [
            `データソース: ${excelData.fileName}`,
            `シート数: ${excelData.sheets.length}`,
            `総行数: ${allRows.length}`,
        ],
    });

    return slides;
}

/**
 * Expand mode — AI enriches and structures the content
 */
async function expandMode(
    excelData: ParsedExcel,
    config: GenerationConfig,
    referenceImageDescriptions?: string[]
): Promise<SlideData[]> {
    const prompt = buildExpandPrompt(excelData, config, referenceImageDescriptions);
    const modelName = config.aiModel || 'gemini-2.0-flash';

    const client = getClient();
    const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
        },
    });

    const text = response.text || '';

    // Parse JSON response
    let slides: SlideData[];
    try {
        const parsed = JSON.parse(text);
        slides = Array.isArray(parsed) ? parsed : parsed.slides || [];
    } catch {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('AIからのレスポンスをパースできませんでした');
        }
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        slides = JSON.parse(jsonStr);
    }

    return slides.map((slide, i) => ({
        ...slide,
        index: i,
        type: slide.type || 'content',
        title: slide.title || `スライド ${i + 1}`,
    }));
}

function buildExpandPrompt(
    excelData: ParsedExcel,
    config: GenerationConfig,
    referenceImageDescriptions?: string[]
): string {
    const designNote = config.designPrompt
        ? `\n\n## ユーザーのデザイン要望:\n${config.designPrompt}`
        : '';

    const templateNote = buildTemplatePromptSection(config.selectedTemplates || []);

    const refImageNote = referenceImageDescriptions && referenceImageDescriptions.length > 0
        ? `\n\n## 参考画像（ユーザーが提供）:
ユーザーは${referenceImageDescriptions.length}枚の参考画像をアップロードしました。
各画像の説明:
${referenceImageDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

**重要**: 参考画像がある場合は、必ず type: "image-text" のスライドを${referenceImageDescriptions.length}枚以上含めてください。
画像はシステムが自動的にスライドに配置します。image-textスライドにはbulletsで補足テキストを含めてください。`
        : '';

    return `あなたは一流のプレゼンテーション資料の構成を設計するコンサルタントです。
McKinseyやBCGが作るレベルの高品質な資料構成を目指してください。

# 目的
以下のExcelデータを分析し、説得力のあるストーリーラインを構築して、${config.pageCount}枚のプレゼンテーションスライド構成をJSON配列で出力してください。

# Excelデータ:
${excelData.textSummary}
${designNote}${templateNote}${refImageNote}

# 制約条件:
- スライド枚数: 必ず${config.pageCount}枚
- デザイン複雑さ: ${config.complexity}

# 出力のJSON構造（各スライドのフィールド定義）:

## 利用可能なスライドタイプと必須フィールド:

1. **title** — 表紙スライド
   - type: "title"
   - title: プレゼン全体のタイトル（データから導かれるテーマを端的に）
   - subtitle: 日付や副題

2. **agenda** — 目次スライド
   - type: "agenda"
   - title: "目次" or "Agenda"
   - bullets: セクション名の配列（最大6項目）

3. **content** — コンテンツスライド（箇条書き）
   - type: "content"
   - title: セクションタイトル
   - bullets: ポイントの配列（3〜5項目。短く、具体的に。「〜である」で終わらせず体言止めも活用）
   - notes: 発表者用メモ（このスライドで話すべきポイント、補足データ等）

4. **two-column** — 2列対比レイアウト
   - type: "two-column"
   - title: セクションタイトル
   - columns: [{ header: "左タイトル", items: ["項目1", "項目2"] }, { header: "右タイトル", items: ["項目1", "項目2"] }]
   - notes: 発表者用メモ

5. **comparison** — 比較スライド  
   - type: "comparison"
   - title: 比較テーマ
   - columns: [{ header: "A", items: [...] }, { header: "B", items: [...] }]
   - notes: 発表者用メモ

6. **chart** — グラフスライド
   - type: "chart"
   - title: グラフタイトル
   - chartType: "bar" | "pie" | "line"（データの性質で最適なものを選択）
   - chartData: { labels: ["ラベル1", "ラベル2", ...], values: [数値1, 数値2, ...] }
   - bullets: グラフの読み取りポイント（任意、1〜3項目）
   - notes: 発表者用メモ（グラフの読み取り方、想定質問への回答等）
   **重要**: labelsとvaluesの要素数は必ず一致させること。valuesは必ず数値型。

7. **image-text** — キーナンバー＋テキスト
   - type: "image-text"
   - title: セクションタイトル  
   - keyNumber: インパクトのある数値（"¥5,000万", "320%", "+15pt"など）
   - keyNumberLabel: 数値の説明（"年間売上成長率" など）
   - bullets: 補足説明（2〜4項目）
   - notes: 発表者用メモ

8. **summary** — まとめスライド
   - type: "summary"
   - title: "まとめ" or "Next Steps"
   - bullets: 要約・アクションアイテム（3〜5項目）
   - notes: 発表者用メモ（締めくくりのトーク、次回アクションの詳細等）

# 共通フィールド:
- **notes**: 全スライドタイプに必ず含めてください。発表者がプレゼン中に参照するメモです。
  データの背景、話法のヒント、想定Q&Aなどを50〜100文字程度で記載。

# ストーリー構成のガイドライン:

1. **導入**: 表紙 → 目次
2. **現状分析**: データの概況をchart/contentで提示
3. **深掘り**: 比較、二軸分析、キーナンバーで洞察を示す
4. **提言**: 具体的なアクションや示唆
5. **締め**: まとめ/ネクストステップ

## 品質チェックリスト:
- [ ] 各スライドのtitleは15文字以内で具体的か？
- [ ] bulletsは「〜すること」のような冗長表現ではなく、端的な体言止めか？
- [ ] chartDataのlabelsとvaluesの数は一致しているか？
- [ ] image-textのkeyNumberはインパクトのある書式か（"¥", "%", "+"付き）？
- [ ] ストーリーに論理的な流れがあるか？
- [ ] 全スライドにnotesが含まれているか？

# 良い例・悪い例:

## ❌ 悪い箇条書きの例:
- "売上が前年比で10%増加しました"
- "市場シェアは上昇傾向にあること"
- "新戦略を検討する必要があること"

## ✅ 良い箇条書きの例:
- "売上高: 前年比+10%（3,800万→4,180万）"
- "市場シェア: 15%→18%に拡大（業界3位→2位）"
- "重点施策: SNSマーケ強化・パートナー開拓"

必ず${config.pageCount}枚のSlideData配列をJSON形式で出力してください。各スライドにnotesフィールドを必ず含めてください。`;
}

/**
 * Regenerate a single slide given the surrounding context
 */
export async function regenerateSingleSlide(
    currentSlide: SlideData,
    allSlides: SlideData[],
    excelData: ParsedExcel,
    config: GenerationConfig
): Promise<SlideData> {
    const modelName = config.aiModel || 'gemini-2.0-flash';

    const prevSlide = allSlides[currentSlide.index - 1];
    const nextSlide = allSlides[currentSlide.index + 1];

    const prompt = `あなたはプレゼンテーション構成のプロです。
以下のスライドを、より良い内容に再生成してください。

## データソース:
${excelData.textSummary}

## 前後のスライド（文脈参照用）:
${prevSlide ? `前のスライド: "${prevSlide.title}" (type: ${prevSlide.type})` : 'なし（最初のスライドです）'}
${nextSlide ? `次のスライド: "${nextSlide.title}" (type: ${nextSlide.type})` : 'なし（最後のスライドです）'}

## 現在のスライド:
${JSON.stringify(currentSlide, null, 2)}

## 指示:
- スライドのtype（${currentSlide.type}）は変更してもOKです
- titleは15文字以内で具体的に
- bulletsは体言止めで端的に
- notesに発表者用メモを含めてください
- chartDataがある場合、labelsとvaluesの要素数は一致させてください
- 前後のスライドとの論理的な流れを維持してください

1つのスライドオブジェクトをJSON形式で出力してください。`;

    const client = getClient();
    const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            temperature: 0.9, // Slightly higher for variety
        },
    });

    const text = response.text || '';
    let newSlide: SlideData;
    try {
        newSlide = JSON.parse(text);
    } catch {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('再生成結果をパースできませんでした');
        newSlide = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    return {
        ...newSlide,
        index: currentSlide.index,
        type: newSlide.type || currentSlide.type,
        title: newSlide.title || currentSlide.title,
        imageDataUrl: currentSlide.imageDataUrl, // preserve embedded image
    };
}
