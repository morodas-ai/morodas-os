/**
 * ojiki-knowledge-base 接続テストスクリプト
 * 使い方: npx tsx scripts/test-knowledge.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { searchKnowledge, askKnowledge } from "../lib/ojikiKnowledge";

async function main() {
    console.log("🧪 ojiki-knowledge-base 接続テスト開始...\n");
    console.log(`  Project ID: ${process.env.GCP_PROJECT_ID}`);
    console.log(`  App ID: ${process.env.VERTEX_SEARCH_APP_ID}`);
    console.log(`  Location: ${process.env.GCP_LOCATION || "global"}\n`);

    // テスト1: 検索
    console.log("📡 テスト1: 検索 (searchKnowledge)");
    console.log('  クエリ: "AIエージェント開発"');
    try {
        const results = await searchKnowledge("AIエージェント開発", 3);
        if (results.length > 0) {
            console.log(`  ✅ 成功！ ${results.length}件の結果:`);
            for (const r of results) {
                console.log(`    - ${r.title}`);
                console.log(`      ${r.snippet.slice(0, 100)}...`);
            }
        } else {
            console.log("  ⚠️ 結果なし（データストアが空か、クエリが一致しない可能性）");
        }
    } catch (error) {
        console.error("  ❌ エラー:", error);
    }

    console.log("\n---\n");

    // テスト2: 生成回答
    console.log("🤖 テスト2: 生成回答 (askKnowledge)");
    console.log('  クエリ: "ユニコの記事で一番人気のテーマは？"');
    try {
        const answer = await askKnowledge("ユニコの記事で一番人気のテーマは？");
        console.log(`  📝 回答: ${answer.summary.slice(0, 200)}...`);
        if (answer.sources.length > 0) {
            console.log(`  📚 参照元: ${answer.sources.length}件`);
            for (const s of answer.sources) {
                console.log(`    - ${s.title}`);
            }
        }
    } catch (error) {
        console.error("  ❌ エラー:", error);
    }

    console.log("\n✨ テスト完了!");
}

main();
