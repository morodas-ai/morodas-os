import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * MORODAS OS API Authentication Utility
 *
 * 2つの認証方式:
 * 1. Bearer Token (外部サービス/n8n向け) — MORODAS_API_KEY 環境変数
 * 2. Internal (ブラウザ同一オリジン) — strict hostname comparison
 *
 * ブラウザからの同一オリジンリクエスト (referer/origin のホスト名が完全一致) は認証スキップ
 * 外部からのAPIリクエストは Bearer Token 必須
 *
 * Security hardening:
 * - referer/origin は URL.hostname で厳密比較（includes攻撃を防止）
 * - APIキー比較は timing-safe（タイミング攻撃を防止）
 * - x-nextjs-data ヘッダーバイパスを廃止（偽装可能）
 */

const MORODAS_API_KEY = process.env.MORODAS_API_KEY;

/**
 * Timing-safe string comparison to prevent timing attacks on API keys.
 */
function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
        return timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
        return false;
    }
}

/**
 * Extract hostname from a URL string safely.
 * Returns null if the URL is invalid.
 */
function extractHostname(urlStr: string): string | null {
    try {
        return new URL(urlStr).hostname;
    } catch {
        return null;
    }
}

/**
 * API認証をチェック。外部リクエストの場合のみ Bearer Token を検証。
 * ブラウザからの同一オリジン fetch (hostname が完全一致) は通す。
 */
export function validateApiRequest(request: NextRequest): NextResponse | null {
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");
    const host = request.headers.get("host")?.split(":")[0]; // ポート番号を除去

    // 同一オリジンからのリクエスト — hostname を厳密比較
    if (host) {
        if (referer) {
            const refererHost = extractHostname(referer);
            if (refererHost && refererHost === host) {
                return null; // OK — same origin
            }
        }
        if (origin) {
            const originHost = extractHostname(origin);
            if (originHost && originHost === host) {
                return null; // OK — same origin
            }
        }
    }

    // MORODAS_API_KEY が未設定なら開発モードとして全部通す
    if (!MORODAS_API_KEY) {
        console.warn("[AUTH] ⚠️ MORODAS_API_KEY is not set — running in dev mode (all requests allowed)");
        return null;
    }

    // Bearer Token チェック (timing-safe)
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        if (safeCompare(token, MORODAS_API_KEY)) {
            return null; // OK
        }
    }

    // X-API-Key ヘッダーチェック (timing-safe, 後方互換)
    if (apiKeyHeader && safeCompare(apiKeyHeader, MORODAS_API_KEY)) {
        return null; // OK
    }

    // 認証失敗
    return NextResponse.json(
        {
            success: false,
            error: {
                code: "UNAUTHORIZED",
                message: "Invalid or missing API key. Use 'Authorization: Bearer <key>' or 'X-API-Key: <key>'",
            },
        },
        { status: 401 }
    );
}
