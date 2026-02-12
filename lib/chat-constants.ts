export const initialQuickReplies = [
    { emoji: "🤖", text: "エージェントって何ですか？" },
    { emoji: "📊", text: "ダッシュボードの見方を教えて" },
    { emoji: "📝", text: "タスクの作り方を教えて" },
    { emoji: "📈", text: "収益レポートを確認したい" },
    { emoji: "👥", text: "クライアント管理について教えて" },
    { emoji: "📰", text: "フィードの使い方は？" },
];

const followUpMap: Record<string, { emoji: string; text: string }[]> = {
    "エージェント": [
        { emoji: "🛠️", text: "エージェントの作り方を教えて" },
        { emoji: "📋", text: "テンプレートから作れますか？" },
        { emoji: "⚙️", text: "自動実行のスケジュール設定は？" },
    ],
    "タスク": [
        { emoji: "✅", text: "タスクの進捗を確認したい" },
        { emoji: "🔔", text: "期限切れのタスクはありますか？" },
        { emoji: "📊", text: "タスクの優先順位を整理して" },
    ],
    "収益": [
        { emoji: "💰", text: "今月の収益目標の進捗は？" },
        { emoji: "📈", text: "売上トレンドを分析して" },
        { emoji: "🏆", text: "一番成果が出ている施策は？" },
    ],
    "クライアント": [
        { emoji: "👤", text: "新しいクライアントを追加したい" },
        { emoji: "📞", text: "最近連絡を取っていないクライアントは？" },
        { emoji: "📊", text: "パイプラインの状況を教えて" },
    ],
    "フィード": [
        { emoji: "📰", text: "今日の注目ニュースは？" },
        { emoji: "🔍", text: "競合の動向を教えて" },
        { emoji: "⭐", text: "トレンドになっているトピックは？" },
    ],
    "ダッシュボード": [
        { emoji: "📊", text: "KPIの状況を教えて" },
        { emoji: "🔔", text: "注意が必要な指標はありますか？" },
        { emoji: "📈", text: "先月との比較を見せて" },
    ],
};

const defaultFollowUps = [
    { emoji: "💡", text: "他に何ができますか？" },
    { emoji: "📊", text: "全体の状況を教えて" },
    { emoji: "🔧", text: "設定を変更したい" },
];

export function getFollowUps(lastAssistantContent: string): { emoji: string; text: string }[] {
    const content = lastAssistantContent.toLowerCase();
    for (const [keyword, followUps] of Object.entries(followUpMap)) {
        if (content.includes(keyword.toLowerCase())) {
            return followUps;
        }
    }
    return defaultFollowUps;
}
