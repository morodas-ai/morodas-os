/**
 * convert-rag-to-md.ts — RAGファイル一括MD変換スクリプト
 *
 * GCSバケット(ojiki-memory-store)のファイルを全てダウンロードし、
 * Markdown形式に変換してローカルに保存する。
 *
 * 使い方: npx tsx scripts/convert-rag-to-md.ts
 *
 * 出力先: docs/knowledge-base/*.md
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { GoogleAuth } from "google-auth-library";
import path from "path";
import fs from "fs";

// --- 設定 ---
const BUCKET_NAME = "ojiki-memory-store";
const OUTPUT_DIR = path.join(process.cwd(), "docs", "knowledge-base");
const KEY_PATH =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "gcp-service-account.json");

// --- 認証 ---
function getAuth(): GoogleAuth {
    return new GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
}

async function getAccessToken(): Promise<string> {
    const auth = getAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || "";
}

// --- GCS操作 ---

interface GCSObject {
    name: string;
    size: string;
    contentType: string;
    updated: string;
}

async function listBucketObjects(): Promise<GCSObject[]> {
    const token = await getAccessToken();
    const allObjects: GCSObject[] = [];
    let pageToken = "";

    do {
        const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o?maxResults=500${pageToken ? `&pageToken=${pageToken}` : ""}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`GCS list error: ${res.status} ${err}`);
        }

        const data = await res.json();
        const items = (data.items || []) as GCSObject[];
        allObjects.push(...items);
        pageToken = data.nextPageToken || "";
    } while (pageToken);

    return allObjects;
}

async function downloadObject(objectName: string): Promise<string> {
    const token = await getAccessToken();
    const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o/${encodeURIComponent(objectName)}?alt=media`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error(`GCS download error for ${objectName}: ${res.status}`);
    }

    return res.text();
}

// --- 変換ロジック ---

function txtToMarkdown(content: string, filename: string): string {
    // .txt はすでにMarkdown風の場合が多い（# 見出しなど）
    // YAML Front Matter を追加して正式なMDにする
    const title = extractTitle(content) || filename.replace(/\.txt$/, "");
    const frontMatter = `---
title: "${title}"
source_file: "${filename}"
converted_at: "${new Date().toISOString()}"
---

`;
    // すでに # で始まっている場合はそのまま、そうでなければトップレベル見出しを追加
    if (content.trimStart().startsWith("#")) {
        return frontMatter + content;
    }
    return frontMatter + `# ${title}\n\n${content}`;
}

function jsonToMarkdown(content: string, filename: string): string {
    const title = filename.replace(/\.json$/, "");
    const frontMatter = `---
title: "${title}"
source_file: "${filename}"
format: "json-converted"
converted_at: "${new Date().toISOString()}"
---

# ${title}

`;

    try {
        const parsed = JSON.parse(content);
        const mdContent = jsonObjectToMd(parsed, 0);
        return frontMatter + mdContent;
    } catch {
        // パースできない場合はコードブロックとして保存
        return frontMatter + "```json\n" + content + "\n```\n";
    }
}

function jsonObjectToMd(obj: unknown, depth: number): string {
    if (obj === null || obj === undefined) return "";

    if (typeof obj === "string") return obj + "\n\n";
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj) + "\n\n";

    if (Array.isArray(obj)) {
        // 配列: 各要素を処理
        if (obj.length === 0) return "";

        // 文字列配列はリスト化
        if (obj.every((item) => typeof item === "string")) {
            return obj.map((item) => `- ${item}`).join("\n") + "\n\n";
        }

        // オブジェクト配列は個別処理
        return obj
            .map((item, i) => {
                if (typeof item === "object" && item !== null) {
                    // タイトルになりそうなキーを探す
                    const record = item as Record<string, unknown>;
                    const titleKey =
                        record.title || record.name || record.heading || `Item ${i + 1}`;
                    const heading = "#".repeat(Math.min(depth + 2, 6)) + " " + String(titleKey);
                    return heading + "\n\n" + jsonObjectToMd(item, depth + 1);
                }
                return `- ${String(item)}\n`;
            })
            .join("\n");
    }

    if (typeof obj === "object") {
        const record = obj as Record<string, unknown>;
        const parts: string[] = [];

        for (const [key, value] of Object.entries(record)) {
            // キーをスキップ（タイトルとして使ったもの等）
            if (key === "title" && depth > 0) continue;

            if (typeof value === "string") {
                // 長いテキストはパラグラフとして
                if (value.length > 100) {
                    parts.push(`**${key}:**\n\n${value}\n`);
                } else {
                    parts.push(`**${key}:** ${value}\n`);
                }
            } else if (typeof value === "number" || typeof value === "boolean") {
                parts.push(`**${key}:** ${String(value)}\n`);
            } else if (Array.isArray(value)) {
                const heading = "#".repeat(Math.min(depth + 2, 6)) + " " + key;
                parts.push(heading + "\n\n" + jsonObjectToMd(value, depth + 1));
            } else if (typeof value === "object" && value !== null) {
                const heading = "#".repeat(Math.min(depth + 2, 6)) + " " + key;
                parts.push(heading + "\n\n" + jsonObjectToMd(value, depth + 1));
            }
        }

        return parts.join("\n");
    }

    return String(obj) + "\n";
}

function extractTitle(content: string): string | null {
    // 最初の # 見出しを探す
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();

    // 最初の非空行を使う
    const firstLine = content.split("\n").find((l) => l.trim().length > 0);
    if (firstLine && firstLine.trim().length < 100) return firstLine.trim();

    return null;
}

function getOutputFilename(objectName: string): string {
    // パスの最後の部分を取得し、拡張子を .md に変換
    const basename = path.basename(objectName);
    const nameWithoutExt = basename.replace(/\.(txt|json|csv|tsv)$/i, "");
    return nameWithoutExt + ".md";
}

// --- メイン ---

async function main() {
    console.log("📦 GCSバケットからRAGファイルを取得中...");
    console.log(`  バケット: gs://${BUCKET_NAME}/`);
    console.log(`  出力先: ${OUTPUT_DIR}/\n`);

    // 出力ディレクトリ作成
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // ファイル一覧取得
    const objects = await listBucketObjects();
    console.log(`📄 ${objects.length}個のファイルを発見\n`);

    // 統計
    let converted = 0;
    let skipped = 0;
    let errors = 0;
    const results: { file: string; status: string; size: number }[] = [];

    for (const obj of objects) {
        const name = obj.name;

        // ディレクトリエントリをスキップ
        if (name.endsWith("/")) {
            skipped++;
            continue;
        }

        const ext = path.extname(name).toLowerCase();
        const outputFilename = getOutputFilename(name);
        const outputPath = path.join(OUTPUT_DIR, outputFilename);

        console.log(`  ⏳ ${name} → ${outputFilename}`);

        try {
            const content = await downloadObject(name);

            let mdContent: string;

            if (ext === ".txt" || ext === ".md") {
                mdContent = txtToMarkdown(content, path.basename(name));
            } else if (ext === ".json") {
                mdContent = jsonToMarkdown(content, path.basename(name));
            } else {
                // その他のファイルもテキストとして変換を試みる
                mdContent = txtToMarkdown(content, path.basename(name));
            }

            fs.writeFileSync(outputPath, mdContent, "utf-8");
            converted++;
            results.push({
                file: outputFilename,
                status: "✅",
                size: Buffer.byteLength(mdContent, "utf-8"),
            });
            console.log(`  ✅ 変換完了 (${(Buffer.byteLength(mdContent, "utf-8") / 1024).toFixed(1)}KB)`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ❌ エラー: ${msg}`);
            errors++;
            results.push({ file: name, status: "❌", size: 0 });
        }
    }

    // サマリー
    console.log("\n" + "=".repeat(60));
    console.log("📊 変換結果サマリー");
    console.log("=".repeat(60));
    console.log(`  ✅ 変換成功: ${converted}件`);
    console.log(`  ⏭️  スキップ: ${skipped}件`);
    console.log(`  ❌ エラー: ${errors}件`);
    console.log(`  📁 出力先: ${OUTPUT_DIR}/`);

    // ファイル一覧をJSONで出力
    const summaryPath = path.join(OUTPUT_DIR, "_conversion_summary.json");
    fs.writeFileSync(
        summaryPath,
        JSON.stringify(
            {
                bucket: BUCKET_NAME,
                converted_at: new Date().toISOString(),
                total_files: objects.length,
                converted,
                skipped,
                errors,
                files: results,
            },
            null,
            2
        ),
        "utf-8"
    );
    console.log(`\n📋 サマリーファイル: ${summaryPath}`);
}

main().catch((err) => {
    console.error("❌ 致命的エラー:", err.message || err);
    process.exit(1);
});
