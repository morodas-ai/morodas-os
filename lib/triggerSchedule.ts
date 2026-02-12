/**
 * MORODAS OS — トリガースケジュール計算ユーティリティ
 *
 * Triggerの frequency/dayOfWeek/dayOfMonth/hour/minute から
 * 次回実行日時（nextFireAt）を計算する
 */

interface TriggerSchedule {
    frequency: string;        // daily, weekly, monthly
    dayOfWeek?: number | null; // 0-6 (日-土)
    dayOfMonth?: number | null; // 1-31
    hour: number;             // 0-23
    minute: number;           // 0-59
    timezone?: string;        // default: Asia/Tokyo
}

/**
 * 次回実行日時を計算
 * タイムゾーンはシンプルにUTC+9（Asia/Tokyo）固定で計算
 */
export function calculateNextFireAt(
    schedule: TriggerSchedule,
    fromDate: Date = new Date()
): Date {
    const { frequency, dayOfWeek, dayOfMonth, hour, minute } = schedule;

    // JST offset (+9 hours)
    const JST_OFFSET = 9 * 60; // minutes
    const now = new Date(fromDate);

    // 現在のJST日時を計算
    const jstNow = new Date(now.getTime() + JST_OFFSET * 60 * 1000);
    const jstHour = jstNow.getUTCHours();
    const jstMinute = jstNow.getUTCMinutes();
    const jstDay = jstNow.getUTCDay(); // 0=Sun
    const jstDate = jstNow.getUTCDate();

    // ターゲットとなるJST日時を構築
    let targetJST = new Date(jstNow);
    targetJST.setUTCHours(hour, minute, 0, 0);

    switch (frequency) {
        case "daily": {
            // 今日の実行時刻がまだ来ていない場合は今日、過ぎていたら明日
            if (jstHour > hour || (jstHour === hour && jstMinute >= minute)) {
                targetJST.setUTCDate(targetJST.getUTCDate() + 1);
            }
            break;
        }

        case "weekly": {
            const targetDay = dayOfWeek ?? 1; // default: Monday
            let daysUntil = targetDay - jstDay;

            if (daysUntil < 0) {
                daysUntil += 7;
            } else if (daysUntil === 0) {
                // 同じ曜日の場合、時刻チェック
                if (jstHour > hour || (jstHour === hour && jstMinute >= minute)) {
                    daysUntil = 7;
                }
            }

            targetJST.setUTCDate(targetJST.getUTCDate() + daysUntil);
            break;
        }

        case "monthly": {
            const targetDate = dayOfMonth ?? 1; // default: 1st
            targetJST.setUTCDate(targetDate);

            // 今月の対象日が過ぎている場合は来月
            if (
                jstDate > targetDate ||
                (jstDate === targetDate && (jstHour > hour || (jstHour === hour && jstMinute >= minute)))
            ) {
                targetJST.setUTCMonth(targetJST.getUTCMonth() + 1);
                targetJST.setUTCDate(targetDate);
            }
            break;
        }

        default:
            // custom or unknown: default to daily
            if (jstHour > hour || (jstHour === hour && jstMinute >= minute)) {
                targetJST.setUTCDate(targetJST.getUTCDate() + 1);
            }
            break;
    }

    // JST → UTC に変換
    const utcTarget = new Date(targetJST.getTime() - JST_OFFSET * 60 * 1000);
    return utcTarget;
}

/**
 * fromDate以降の実行予定を最大count件返す（プレビュー用）
 */
export function getUpcomingSchedules(
    schedule: TriggerSchedule,
    count: number = 5,
    fromDate: Date = new Date()
): Date[] {
    const results: Date[] = [];
    let cursor = fromDate;

    for (let i = 0; i < count; i++) {
        const next = calculateNextFireAt(schedule, cursor);
        results.push(next);
        // 1分後からスタートして次を計算
        cursor = new Date(next.getTime() + 60 * 1000);
    }

    return results;
}
