/**
 * Ojiki Knowledge Base - Vertex AI Search Integration
 *
 * ojiki-knowledge-base（Vertex AI Search Enterprise）に対して
 * サービスアカウント認証で検索クエリを実行し、ユニコ記事600件のナレッジから
 * 関連ドキュメントと生成回答（Summary）を取得する。
 *
 * 認証: gcp-service-account.json（サービスアカウントキー）
 *
 * 必要な環境変数:
 *   GCP_PROJECT_ID         - Google Cloud プロジェクトID (default: gen-lang-client-0102510791)
 *   GCP_LOCATION           - データストアのロケーション (default: global)
 *   VERTEX_SEARCH_APP_ID   - Search App ID (Agent Builder で作成)
 *   GOOGLE_APPLICATION_CREDENTIALS - サービスアカウントキーのパス (default: ./gcp-service-account.json)
 */

import { GoogleAuth } from "google-auth-library";
import path from "path";

// --- 型定義 ---

export interface KnowledgeSearchResult {
    id: string;
    title: string;
    snippet: string;
    uri?: string;
    relevanceScore?: number;
}

export interface KnowledgeAnswer {
    summary: string;
    sources: KnowledgeSearchResult[];
    query: string;
}

// --- 設定（環境変数は呼び出し時に読み取り） ---

function getProjectId(): string {
    return process.env.GCP_PROJECT_ID || "gen-lang-client-0102510791";
}
function getLocation(): string {
    return process.env.GCP_LOCATION || "global";
}
function getAppId(): string {
    return process.env.VERTEX_SEARCH_APP_ID || "";
}

// サービスアカウントキーのパス
function getKeyPath(): string {
    return (
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(process.cwd(), "gcp-service-account.json")
    );
}

// --- 認証 ---

let authClient: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
    if (!authClient) {
        authClient = new GoogleAuth({
            keyFile: getKeyPath(),
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });
    }
    return authClient;
}

async function getAccessToken(): Promise<string> {
    const auth = getAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || "";
}

// --- エンドポイント ---

function getSearchEndpoint(): string {
    return `https://discoveryengine.googleapis.com/v1/projects/${getProjectId()}/locations/${getLocation()}/collections/default_collection/engines/${getAppId()}/servingConfigs/default_search:search`;
}

function getAnswerEndpoint(): string {
    return `https://discoveryengine.googleapis.com/v1/projects/${getProjectId()}/locations/${getLocation()}/collections/default_collection/engines/${getAppId()}/servingConfigs/default_search:answer`;
}

// --- 設定確認 ---

function isConfigured(): boolean {
    if (!getAppId()) {
        console.warn("VERTEX_SEARCH_APP_ID が未設定です。ojiki-knowledge-base を使用できません。");
        return false;
    }
    return true;
}

// --- 検索機能 ---

/**
 * ojiki-knowledge-base から関連ドキュメントを検索
 */
export async function searchKnowledge(
    query: string,
    maxResults: number = 5
): Promise<KnowledgeSearchResult[]> {
    if (!isConfigured()) return [];

    try {
        const token = await getAccessToken();

        const response = await fetch(getSearchEndpoint(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query,
                pageSize: maxResults,
                queryExpansionSpec: { condition: "AUTO" },
                spellCorrectionSpec: { mode: "AUTO" },
                contentSearchSpec: {
                    snippetSpec: { returnSnippet: true, maxSnippetCount: 3 },
                    summarySpec: {
                        summaryResultCount: maxResults,
                        includeCitations: true,
                    },
                    extractiveContentSpec: {
                        maxExtractiveAnswerCount: 2,
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Vertex AI Search error:", response.status, errorText);
            return [];
        }

        const data = await response.json();
        return parseSearchResults(data);
    } catch (error) {
        console.error("Knowledge search failed:", error);
        return [];
    }
}

/**
 * ojiki-knowledge-base に質問し、生成回答（Enterprise RAG応答）を取得
 */
export async function askKnowledge(query: string): Promise<KnowledgeAnswer> {
    if (!isConfigured()) {
        return {
            summary: "⚠️ ナレッジベースが未設定です。VERTEX_SEARCH_APP_ID を .env に追加してください。",
            sources: [],
            query,
        };
    }

    try {
        const token = await getAccessToken();

        // Answer API（Enterprise機能 - 生成回答）
        const response = await fetch(getAnswerEndpoint(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: { text: query },
                answerGenerationSpec: {
                    modelSpec: { modelVersion: "gemini-2.0-flash-001/answer_gen/v1" },
                    promptSpec: {
                        preamble:
                            "あなたはユニコ（AIエージェント開発の専門家）の過去記事に基づいて回答するアシスタントです。" +
                            "回答は具体的で、引用元の記事を参照しながら答えてください。" +
                            "日本語で回答してください。",
                    },
                    includeCitations: true,
                    answerLanguageCode: "ja",
                },
                searchSpec: {
                    searchParams: {
                        maxReturnResults: 5,
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Vertex AI Answer error:", response.status, errorText);

            // Answer API が使えない場合は Search にフォールバック
            const searchResults = await searchKnowledge(query);
            return {
                summary:
                    searchResults.length > 0
                        ? `関連記事が${searchResults.length}件見つかりました: ${searchResults.map((r) => r.title).join(", ")}`
                        : "関連する記事が見つかりませんでした。",
                sources: searchResults,
                query,
            };
        }

        const data = await response.json();
        return parseAnswerResponse(data, query);
    } catch (error) {
        console.error("Knowledge answer failed:", error);
        return {
            summary: "ナレッジベースへの接続に失敗しました。",
            sources: [],
            query,
        };
    }
}

/**
 * チャット用: クエリに関連するナレッジをコンテキスト文字列として取得
 * Gemini のプロンプトに注入するために使用
 */
export async function getKnowledgeContext(query: string): Promise<string | null> {
    const results = await searchKnowledge(query, 3);
    if (results.length === 0) return null;

    const context = results
        .map((r, i) => `[参考${i + 1}] ${r.title}\n${r.snippet}`)
        .join("\n\n");

    return `\n--- 以下はオジキ・ナレッジベース（ユニコ記事）から検索された参考情報です ---\n${context}\n--- 参考情報ここまで ---`;
}

// --- パーサー ---

function parseSearchResults(
    data: Record<string, unknown>
): KnowledgeSearchResult[] {
    const results: KnowledgeSearchResult[] = [];
    const searchResults =
        (data.results as Array<Record<string, unknown>>) || [];

    for (const result of searchResults) {
        const document = result.document as Record<string, unknown> | undefined;
        if (!document) continue;

        const derivedStructData = document.derivedStructData as
            | Record<string, unknown>
            | undefined;
        const structData = document.structData as
            | Record<string, unknown>
            | undefined;

        // スニペット取得
        let snippet = "";
        const snippets = derivedStructData?.snippets as
            | Array<Record<string, unknown>>
            | undefined;
        if (snippets && snippets.length > 0) {
            snippet = (snippets[0].snippet as string) || "";
        }

        // 抽出回答の取得
        const extractiveAnswers = derivedStructData?.extractive_answers as
            | Array<Record<string, unknown>>
            | undefined;
        if (!snippet && extractiveAnswers && extractiveAnswers.length > 0) {
            snippet = (extractiveAnswers[0].content as string) || "";
        }

        results.push({
            id: (document.id as string) || "",
            title:
                (structData?.title as string) ||
                (derivedStructData?.title as string) ||
                "無題",
            snippet: snippet.replace(/<[^>]*>/g, ""), // HTMLタグ除去
            uri:
                (derivedStructData?.link as string) ||
                (derivedStructData?.uri as string),
            relevanceScore: result.relevanceScore as number | undefined,
        });
    }

    return results;
}

function parseAnswerResponse(
    data: Record<string, unknown>,
    query: string
): KnowledgeAnswer {
    const answer = data.answer as Record<string, unknown> | undefined;
    const answerText = (answer?.answerText as string) || "";

    // 参照元の取得
    const sources: KnowledgeSearchResult[] = [];
    const references =
        (answer?.references as Array<Record<string, unknown>>) || [];
    for (const ref of references) {
        const chunkInfo = ref.chunkInfo as Record<string, unknown> | undefined;
        const documentMetadata = chunkInfo?.documentMetadata as
            | Record<string, unknown>
            | undefined;

        sources.push({
            id: (documentMetadata?.uri as string) || "",
            title: (documentMetadata?.title as string) || "参照元",
            snippet: (chunkInfo?.content as string) || "",
        });
    }

    return {
        summary: answerText || "回答を生成できませんでした。",
        sources,
        query,
    };
}
