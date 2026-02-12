/**
 * search-rag.ts — RAG検索CLI
 *
 * Antigravityがターミナルから ojiki-knowledge-base（ユニコ記事600件）を
 * 検索するためのCLIツール。
 *
 * 使い方:
 *   npx tsx scripts/search-rag.ts search "Chrome MCP Server"
 *   npx tsx scripts/search-rag.ts search "AIエージェント" --max 10
 *   npx tsx scripts/search-rag.ts ask "ユニコがMCPについて書いた内容は？"
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { searchKnowledge, askKnowledge } from "../lib/ojikiKnowledge";

// --- CLI引数パース ---

function parseArgs(): { mode: "search" | "ask"; query: string; max: number } {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error(`
使い方:
  npx tsx scripts/search-rag.ts search "検索キーワード" [--max N]
  npx tsx scripts/search-rag.ts ask "質問文"

モード:
  search  関連記事のスニペットを取得（軽量・高速）
  ask     RAG生成回答を取得（Enterprise機能・要約付き）

オプション:
  --max N  検索結果の最大件数（デフォルト: 5、searchモードのみ）
`);
        process.exit(1);
    }

    const mode = args[0] as "search" | "ask";
    if (mode !== "search" && mode !== "ask") {
        console.error(`❌ モードは "search" または "ask" を指定してください。`);
        process.exit(1);
    }

    const query = args[1];
    let max = 5;

    const maxIdx = args.indexOf("--max");
    if (maxIdx !== -1 && args[maxIdx + 1]) {
        max = parseInt(args[maxIdx + 1], 10);
        if (isNaN(max) || max < 1) max = 5;
    }

    return { mode, query, max };
}

// --- メイン ---

async function main() {
    const { mode, query, max } = parseArgs();

    if (mode === "search") {
        console.error(`🔍 RAG検索: "${query}" (最大${max}件)\n`);

        const results = await searchKnowledge(query, max);

        if (results.length === 0) {
            console.error("⚠️ 該当する記事が見つかりませんでした。");
            // JSONでも空配列を出力
            console.log(JSON.stringify({ query, mode: "search", results: [] }, null, 2));
            return;
        }

        const output = {
            query,
            mode: "search",
            result_count: results.length,
            results: results.map((r) => ({
                id: r.id,
                title: r.title,
                snippet: r.snippet,
                uri: r.uri || null,
                relevance_score: r.relevanceScore || null,
            })),
        };

        console.log(JSON.stringify(output, null, 2));
        console.error(`\n✅ ${results.length}件の結果を取得しました。`);
    } else {
        // ask モード
        console.error(`🤖 RAG質問: "${query}"\n`);

        const answer = await askKnowledge(query);

        const output = {
            query,
            mode: "ask",
            summary: answer.summary,
            source_count: answer.sources.length,
            sources: answer.sources.map((s) => ({
                id: s.id,
                title: s.title,
                snippet: s.snippet,
            })),
        };

        console.log(JSON.stringify(output, null, 2));
        console.error(`\n✅ 回答を生成しました（参照元: ${answer.sources.length}件）`);
    }
}

main().catch((err) => {
    console.error("❌ エラー:", err.message || err);
    process.exit(1);
});
