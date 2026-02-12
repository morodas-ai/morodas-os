/**
 * sync-memory-to-gcs.ts — メモリファイルをGCSに同期するスクリプト
 *
 * gackto-workspace/memory/ 内の .md ファイルを
 * GCSバケット(ojiki-memory-store) の txt/ フォルダにアップロードする。
 *
 * 既存ファイルとの差分を検出し、新規・更新分のみアップロードする。
 *
 * 使い方:
 *   npx tsx scripts/sync-memory-to-gcs.ts          # 差分のみアップロード
 *   npx tsx scripts/sync-memory-to-gcs.ts --force   # 全ファイル強制アップロード
 *   npx tsx scripts/sync-memory-to-gcs.ts --dry-run  # 何がアップロードされるか確認
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { GoogleAuth } from "google-auth-library";
import path from "path";
import fs from "fs";

// --- 設定 ---
const BUCKET_NAME = "ojiki-memory-store";
const GCS_PREFIX = "txt/"; // GCS内のフォルダ（既存ファイルと同じ場所）
const MEMORY_DIR =
    process.env.MEMORY_DIR ||
    path.resolve("/Users/kazuaki/gackto-workspace/memory");
const KEY_PATH =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "gcp-service-account.json");

// アップロード対象の拡張子
const TARGET_EXTENSIONS = [".md"];

// 除外パターン（内省系・機密ファイル）
const EXCLUDE_PATTERNS = [
    /^reflections/i,
    /^ojiki-inner/i,
    /^self-diagnosis\//i,
    /INDEX\.md$/i,
    /learned-rules\.md$/i,
];

// --- 引数パース ---
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");

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
    updated: string;
    md5Hash?: string;
}

async function listBucketObjects(): Promise<Map<string, GCSObject>> {
    const token = await getAccessToken();
    const objects = new Map<string, GCSObject>();
    let pageToken = "";

    do {
        const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}/o?prefix=${GCS_PREFIX}&maxResults=500${pageToken ? `&pageToken=${pageToken}` : ""}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`GCS list error: ${res.status} ${err}`);
        }

        const data = await res.json();
        const items = (data.items || []) as GCSObject[];
        for (const item of items) {
            objects.set(item.name, item);
        }
        pageToken = data.nextPageToken || "";
    } while (pageToken);

    return objects;
}

async function uploadToGCS(
    localPath: string,
    gcsObjectName: string,
    content: string
): Promise<void> {
    const token = await getAccessToken();
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(gcsObjectName)}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain; charset=utf-8",
        },
        body: content,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(
            `GCS upload error for ${gcsObjectName}: ${res.status} ${err}`
        );
    }
}

// --- ローカルファイル操作 ---

function getLocalFiles(): { relativePath: string; fullPath: string }[] {
    const files: { relativePath: string; fullPath: string }[] = [];

    function walk(dir: string, prefix: string = "") {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath, relPath);
            } else if (
                TARGET_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
            ) {
                files.push({ relativePath: relPath, fullPath });
            }
        }
    }

    walk(MEMORY_DIR);
    return files;
}

function shouldExclude(relativePath: string): boolean {
    return EXCLUDE_PATTERNS.some((pattern) => pattern.test(relativePath));
}

function mdToTxtName(mdPath: string): string {
    // enterprise-sales.md → txt/enterprise-sales.txt
    return GCS_PREFIX + mdPath.replace(/\.md$/, ".txt");
}

// --- メイン ---

async function main() {
    console.log("🧠 MORODAS Memory → GCS 同期スクリプト");
    console.log(`📂 ソース: ${MEMORY_DIR}`);
    console.log(`☁️  バケット: gs://${BUCKET_NAME}/${GCS_PREFIX}`);
    console.log(
        `⚙️  モード: ${DRY_RUN ? "ドライラン" : FORCE ? "強制アップロード" : "差分同期"}`
    );
    console.log("---");

    // メモリディレクトリの存在確認
    if (!fs.existsSync(MEMORY_DIR)) {
        console.error(`❌ メモリディレクトリが見つかりません: ${MEMORY_DIR}`);
        process.exit(1);
    }

    // サービスアカウントキーの存在確認
    if (!fs.existsSync(KEY_PATH)) {
        console.error(`❌ GCPサービスアカウントキーが見つかりません: ${KEY_PATH}`);
        process.exit(1);
    }

    // ローカルファイル一覧
    const localFiles = getLocalFiles();
    console.log(`📄 ローカルファイル: ${localFiles.length}件`);

    // 除外フィルタ適用
    const targetFiles = localFiles.filter(
        (f) => !shouldExclude(f.relativePath)
    );
    const excludedCount = localFiles.length - targetFiles.length;
    if (excludedCount > 0) {
        console.log(`🔒 除外: ${excludedCount}件（内省系・機密ファイル）`);
    }

    // GCS既存ファイル一覧を取得
    console.log("☁️  GCS既存ファイル一覧を取得中...");
    const gcsObjects = await listBucketObjects();
    console.log(`☁️  GCS既存ファイル: ${gcsObjects.size}件`);

    // 差分検出
    const toUpload: { relativePath: string; fullPath: string; reason: string }[] = [];

    for (const file of targetFiles) {
        const gcsName = mdToTxtName(file.relativePath);
        const existing = gcsObjects.get(gcsName);

        if (!existing) {
            toUpload.push({ ...file, reason: "新規" });
        } else if (FORCE) {
            toUpload.push({ ...file, reason: "強制更新" });
        } else {
            // ファイルサイズで変更検出（簡易）
            const localSize = fs.statSync(file.fullPath).size;
            const gcsSize = parseInt(existing.size, 10);
            // .md → .txt の変換でサイズが変わるので、大きな差分のみ
            if (Math.abs(localSize - gcsSize) > 100) {
                toUpload.push({ ...file, reason: "更新あり" });
            }
        }
    }

    console.log(`\n📤 アップロード対象: ${toUpload.length}件`);

    if (toUpload.length === 0) {
        console.log("✅ 全ファイルが同期済みです。");
        return;
    }

    // アップロード対象一覧表示
    for (const file of toUpload) {
        const gcsName = mdToTxtName(file.relativePath);
        console.log(`  ${file.reason}: ${file.relativePath} → ${gcsName}`);
    }

    if (DRY_RUN) {
        console.log("\n🔍 ドライランモード: 実際のアップロードはスキップしました。");
        return;
    }

    // アップロード実行
    console.log("\n⬆️  アップロード開始...");
    let success = 0;
    let failed = 0;

    for (const file of toUpload) {
        const gcsName = mdToTxtName(file.relativePath);
        try {
            const content = fs.readFileSync(file.fullPath, "utf-8");
            await uploadToGCS(file.fullPath, gcsName, content);
            success++;
            console.log(`  ✅ ${file.relativePath}`);
        } catch (err) {
            failed++;
            console.error(
                `  ❌ ${file.relativePath}: ${err instanceof Error ? err.message : err}`
            );
        }

        // レート制限回避: 100ms 待機
        await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`\n📊 結果: ${success}件成功 / ${failed}件失敗 / ${toUpload.length}件中`);

    if (success > 0) {
        console.log("\n⚠️  注意: Vertex AI Search のインデックスは自動更新されます。");
        console.log("    反映には数分〜数十分かかる場合があります。");
    }
}

main().catch((err) => {
    console.error("❌ エラー:", err);
    process.exit(1);
});
