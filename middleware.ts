import { NextRequest, NextResponse } from "next/server";
import { validateApiRequest } from "@/lib/auth";

/**
 * MORODAS OS Middleware
 *
 * 外部からの API アクセスに対して認証を要求する。
 * ブラウザからの同一オリジンリクエストはスキップ。
 */
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // API ルートのみ認証チェック対象
    if (path.startsWith("/api/")) {
        // 公開 API（認証不要）— 外部サービスからのコールバック
        // ⚠️ これらのルートは独自の認証メカニズム（CRON_SECRET, Webhook署名等）を持つ
        const publicPaths = [
            "/api/cron",                           // Vercel Cron (独自のCRON_SECRET検証あり)
            "/api/cron/metrics",                   // Metrics Cron (独自のCRON_SECRET検証あり)
            "/api/content-studio/*/callback",       // n8n からのコールバック
            "/api/github/webhook",                  // GitHub Webhook (署名検証あり)
            "/api/clients/webhook",                 // n8n 予約受付ワークフロー
            "/api/n8n-webhook",                     // n8n 統一Webhook受信 (独自のN8N_WEBHOOK_SECRET検証あり)
        ];

        const isPublic = publicPaths.some((p) => {
            if (p.includes("*")) {
                const regex = new RegExp("^" + p.replace(/\*/g, "[^/]+") + "$");
                return regex.test(path);
            }
            // 完全一致 (startsWith → exact match で /api/cron-evil を防止)
            return path === p;
        });

        if (!isPublic) {
            // GETリクエストはブラウザからの読み取り — 同一オリジンなら通す
            // POST/PATCH/DELETE は外部からの書き込み — 必ず認証
            if (request.method !== "GET") {
                const authResult = validateApiRequest(request);
                if (authResult) return authResult;
            } else {
                // 機密性の高いGETエンドポイントは認証必須
                const sensitiveGetPaths = [
                    "/api/github/status",  // GitHub設定情報
                    "/api/settings",       // アプリ設定情報
                ];
                const isSensitiveGet = sensitiveGetPaths.some((p) => path === p || path.startsWith(p + "/"));
                if (isSensitiveGet) {
                    const authResult = validateApiRequest(request);
                    if (authResult) return authResult;
                }
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
