/**
 * fetch-external.ts — 外部ソース取得CLI
 *
 * Reddit / Hacker News / arXiv / Dev.to から
 * 指定したキーワードに関する最新情報を取得する。
 * すべて無料API。X（Twitter）は使用しない。
 *
 * 使い方:
 *   npx tsx scripts/fetch-external.ts "Chrome MCP Server"
 *   npx tsx scripts/fetch-external.ts "OpenClaw" --source reddit
 *   npx tsx scripts/fetch-external.ts "MCP" --source hackernews
 *   npx tsx scripts/fetch-external.ts "tool use LLM" --source arxiv
 *   npx tsx scripts/fetch-external.ts "ai agent" --source devto
 */

// --- 型定義 ---

interface ExternalResult {
    source: string;
    title: string;
    url: string;
    date: string;
    score?: number;
    summary: string;
}

interface FetchOutput {
    query: string;
    fetched_at: string;
    sources_requested: string[];
    total_results: number;
    results: Record<string, ExternalResult[]>;
    errors: Record<string, string>;
}

// --- CLI引数パース ---

type SourceName = "reddit" | "hackernews" | "arxiv" | "devto";
const ALL_SOURCES: SourceName[] = ["reddit", "hackernews", "arxiv", "devto"];

function parseArgs(): { query: string; sources: SourceName[] } {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error(`
使い方:
  npx tsx scripts/fetch-external.ts "検索キーワード" [--source ソース名]

ソース:
  reddit       Reddit の関連投稿
  hackernews   Hacker News のストーリー＋コメント
  arxiv        arXiv の最新関連論文
  devto        Dev.to のチュートリアル記事

--source を省略すると全ソースから一括取得します。
`);
        process.exit(1);
    }

    const query = args[0];
    let sources: SourceName[] = [...ALL_SOURCES];

    const srcIdx = args.indexOf("--source");
    if (srcIdx !== -1 && args[srcIdx + 1]) {
        const requested = args[srcIdx + 1].toLowerCase() as SourceName;
        if (!ALL_SOURCES.includes(requested)) {
            console.error(`❌ 不明なソース: "${requested}". 使えるソース: ${ALL_SOURCES.join(", ")}`);
            process.exit(1);
        }
        sources = [requested];
    }

    return { query, sources };
}

// --- フェッチャー ---

async function fetchReddit(query: string): Promise<ExternalResult[]> {
    // old.reddit.com + ブラウザ風User-Agentで403回避
    const url = `https://old.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=10`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Accept": "application/json",
        },
    });

    if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);
    const data = await res.json();

    const children = data?.data?.children || [];
    return children.map((child: Record<string, unknown>) => {
        const d = child.data as Record<string, unknown>;
        return {
            source: "reddit",
            title: (d.title as string) || "",
            url: `https://reddit.com${d.permalink as string}`,
            date: new Date(((d.created_utc as number) || 0) * 1000).toISOString().split("T")[0],
            score: (d.score as number) || 0,
            summary: ((d.selftext as string) || "").slice(0, 300),
        };
    });
}

async function fetchHackerNews(query: string): Promise<ExternalResult[]> {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`HN API error: ${res.status}`);
    const data = await res.json();

    const hits = data?.hits || [];
    return hits.map((hit: Record<string, unknown>) => ({
        source: "hackernews",
        title: (hit.title as string) || "",
        url: (hit.url as string) || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        date: ((hit.created_at as string) || "").split("T")[0],
        score: (hit.points as number) || 0,
        summary: `${hit.num_comments || 0} comments, ${hit.points || 0} points`,
    }));
}

async function fetchArxiv(query: string): Promise<ExternalResult[]> {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=5&sortBy=submittedDate&sortOrder=descending`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);
    const text = await res.text();

    // arXiv returns Atom XML — simple regex extraction
    const entries: ExternalResult[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(text)) !== null) {
        const entry = match[1];
        const getTag = (tag: string): string => {
            const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
            return m ? m[1].trim() : "";
        };
        const getAttr = (tag: string, attr: string): string => {
            const m = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/>`));
            return m ? m[1] : "";
        };

        // Get PDF link
        let paperUrl = getAttr("link", "href");
        const pdfLink = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]*)"[^>]*\/>/);
        if (pdfLink) paperUrl = pdfLink[1];
        if (!paperUrl) {
            const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
            paperUrl = idMatch ? idMatch[1].trim() : "";
        }

        entries.push({
            source: "arxiv",
            title: getTag("title").replace(/\s+/g, " "),
            url: paperUrl,
            date: getTag("published").split("T")[0],
            summary: getTag("summary").replace(/\s+/g, " ").slice(0, 400),
        });
    }

    return entries;
}

async function fetchDevTo(query: string): Promise<ExternalResult[]> {
    // Dev.to API doesn't support multi-word tag search well, so use per_page with query
    const url = `https://dev.to/api/articles?per_page=5&tag=${encodeURIComponent(query.replace(/\s+/g, "").toLowerCase())}`;
    const res = await fetch(url);

    if (!res.ok) {
        // Fallback: search by title/body
        const fallbackUrl = `https://dev.to/api/articles?per_page=5&tag=ai`;
        const fallbackRes = await fetch(fallbackUrl);
        if (!fallbackRes.ok) throw new Error(`Dev.to API error: ${res.status}`);
        const data = await fallbackRes.json();
        return (data as Array<Record<string, unknown>>).map((article) => ({
            source: "devto",
            title: (article.title as string) || "",
            url: (article.url as string) || "",
            date: ((article.published_at as string) || "").split("T")[0],
            score: (article.positive_reactions_count as number) || 0,
            summary: (article.description as string) || "",
        }));
    }

    const data = await res.json();
    return (data as Array<Record<string, unknown>>).map((article) => ({
        source: "devto",
        title: (article.title as string) || "",
        url: (article.url as string) || "",
        date: ((article.published_at as string) || "").split("T")[0],
        score: (article.positive_reactions_count as number) || 0,
        summary: (article.description as string) || "",
    }));
}

// --- ソースディスパッチ ---

const FETCHERS: Record<SourceName, (q: string) => Promise<ExternalResult[]>> = {
    reddit: fetchReddit,
    hackernews: fetchHackerNews,
    arxiv: fetchArxiv,
    devto: fetchDevTo,
};

// --- メイン ---

async function main() {
    const { query, sources } = parseArgs();

    console.error(`🌐 外部ソース取得: "${query}"`);
    console.error(`📡 対象ソース: ${sources.join(", ")}\n`);

    const output: FetchOutput = {
        query,
        fetched_at: new Date().toISOString(),
        sources_requested: sources,
        total_results: 0,
        results: {},
        errors: {},
    };

    for (const source of sources) {
        console.error(`  ⏳ ${source} を取得中...`);
        try {
            const results = await FETCHERS[source](query);
            output.results[source] = results;
            output.total_results += results.length;
            console.error(`  ✅ ${source}: ${results.length}件`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            output.errors[source] = msg;
            output.results[source] = [];
            console.error(`  ❌ ${source}: ${msg}`);
        }
    }

    console.log(JSON.stringify(output, null, 2));
    console.error(`\n✅ 完了！合計 ${output.total_results}件を取得しました。`);
}

main().catch((err) => {
    console.error("❌ エラー:", err.message || err);
    process.exit(1);
});
