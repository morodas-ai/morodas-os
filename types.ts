/**
 * MORODAS OS — フロントエンド型定義
 *
 * Prismaモデルに基づくが、API経由のJSON応答ではDateがstringに
 * シリアライズされるため、日付フィールドはstringで定義する。
 *
 * Prismaスキーマ変更時はここも確認すること。
 */

// ===== Agent =====
export interface Agent {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    config?: string;
    enabled: boolean;
    lastRunAt: string | null;
    updatedAt?: string;
    keyCapabilities?: string | null;
    recommendedUses?: string | null;
    _count?: { reports: number };
}

// ===== Task =====
export interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    estimatedMinutes?: number | null;
    agentType?: string | null;
    stagnantDays?: number;
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
    dueDate?: string | null;
}

// ===== Alert =====
export interface Alert {
    id: string;
    title: string;
    message: string;
    type: string;
    severity: string;
    isDismissed?: boolean;
    isRead?: boolean;
    relatedId?: string | null;
    relatedType?: string | null;
}

// ===== Message =====
export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
    timestamp?: Date;
}

// ===== ChatSession =====
export interface ChatSession {
    id: string;
    title: string;
    lastMessage?: string;
    updatedAt: string;
}

// ===== Metric =====
export interface Metric {
    name: string;
    value: number;
    change?: number | null;
    changePercent?: number | null;
    target?: number | null;
}

// ===== MonthlyRevenue =====
export interface MonthlyRevenue {
    totalRevenue: number;
    targetRevenue: number;
}
