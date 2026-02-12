import { NextResponse } from "next/server";
import { searchKnowledge, askKnowledge } from "@/lib/ojikiKnowledge";

/**
 * GET /api/knowledge/search?q=<query>&mode=<search|ask>
 *
 * ojiki-knowledge-base（Vertex AI Search Enterprise）への検索エンドポイント。
 *
 * mode=search: 関連ドキュメントを返す（デフォルト）
 * mode=ask:    生成回答（RAG応答）を返す（Enterprise機能）
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const mode = searchParams.get("mode") || "search";

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "クエリパラメータ 'q' は必須です" },
                },
                { status: 400 }
            );
        }

        if (mode === "ask") {
            // Enterprise RAG: 生成回答モード
            const answer = await askKnowledge(query);
            return NextResponse.json({
                success: true,
                mode: "ask",
                data: {
                    summary: answer.summary,
                    sources: answer.sources,
                    query: answer.query,
                },
            });
        }

        // 通常検索モード
        const maxResults = parseInt(searchParams.get("limit") || "5", 10);
        const results = await searchKnowledge(query, maxResults);

        return NextResponse.json({
            success: true,
            mode: "search",
            data: {
                results,
                count: results.length,
                query,
            },
        });
    } catch (error) {
        console.error("Knowledge search API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: { code: "INTERNAL_ERROR", message: "ナレッジ検索に失敗しました" },
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/knowledge/search
 *
 * n8n ワークフロー等からの呼び出し用。
 * Body: { query: string, mode?: "search" | "ask" }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, mode = "search" } = body;

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "'query' フィールドは必須です" },
                },
                { status: 400 }
            );
        }

        if (mode === "ask") {
            const answer = await askKnowledge(query);
            return NextResponse.json({ success: true, mode: "ask", data: answer });
        }

        const results = await searchKnowledge(query, body.limit || 5);
        return NextResponse.json({
            success: true,
            mode: "search",
            data: { results, count: results.length, query },
        });
    } catch (error) {
        console.error("Knowledge search POST error:", error);
        return NextResponse.json(
            {
                success: false,
                error: { code: "INTERNAL_ERROR", message: "ナレッジ検索に失敗しました" },
            },
            { status: 500 }
        );
    }
}
