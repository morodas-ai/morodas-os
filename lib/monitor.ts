import prisma from "@/lib/prisma";
import { differenceInDays } from "date-fns";

/**
 * 停滞タスクを検知し、アラートを作成する
 * @returns 検知された停滞タスク数
 */
export async function checkStagnation() {
    const STAGNATION_THRESHOLD_DAYS = 2;
    const now = new Date();

    // 1. 完了していないタスクを取得
    const tasks = await prisma.task.findMany({
        where: {
            status: { not: "done" },
        },
    });

    let stagnantCount = 0;

    for (const task of tasks) {
        const lastActivity = new Date(task.lastActivityAt);
        const daysInactive = differenceInDays(now, lastActivity);

        // 2. 閾値を超えているかチェック
        if (daysInactive >= STAGNATION_THRESHOLD_DAYS) {
            stagnantCount++;

            // 3. アラートを作成・更新 (Upsert)
            // 同じタスクに対する未解決の停滞アラートがあれば更新、なければ作成
            const alertTitle = `停滞検知: ${task.title}`;
            const alertMessage = `このタスクは ${daysInactive} 日間動きがありません。進捗を更新するか、ステータスを見直してください。`;

            // 既存の未解決アラートを探す
            const existingAlert = await prisma.alert.findFirst({
                where: {
                    type: "stagnation",
                    relatedId: task.id,
                    relatedType: "task",
                    isDismissed: false,
                    isRead: false,
                },
            });

            if (existingAlert) {
                // メッセージと日時を更新
                await prisma.alert.update({
                    where: { id: existingAlert.id },
                    data: {
                        message: alertMessage,
                        // 既に通知済みなら再通知しない（isRead=falseのまま）
                    },
                });
            } else {
                // 新規アラート作成
                await prisma.alert.create({
                    data: {
                        type: "stagnation",
                        severity: "warning",
                        title: alertTitle,
                        message: alertMessage,
                        relatedType: "task",
                        relatedId: task.id,
                    },
                });
            }

            // 4. タスクの stagnantDays を更新
            if (task.stagnantDays !== daysInactive) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { stagnantDays: daysInactive },
                });
            }
        } else {
            // 停滞していない場合、もし過去の停滞マークがあればクリア
            if (task.stagnantDays > 0) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: { stagnantDays: 0 },
                });

                // 関連するアラートがあれば自動解決
                await prisma.alert.updateMany({
                    where: {
                        type: "stagnation",
                        relatedId: task.id,
                        relatedType: "task",
                        isDismissed: false
                    },
                    data: {
                        isDismissed: true,
                        resolvedAt: now
                    }
                });
            }
        }
    }

    return stagnantCount;
}
