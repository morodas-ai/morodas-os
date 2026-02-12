// ========================================
// SlideForge — Template Catalog
// ========================================

// --- Types ---
export interface FrameworkCategory {
    id: string;
    icon: string;
    label: string;
    description: string;
}

export interface FrameworkTemplate {
    id: string;
    categoryId: string;
    label: string;
    description: string;
    layoutHint: string; // AIへの指示用: どのSlideTypeで表現するか
}

export interface PresetCombo {
    id: string;
    icon: string;
    name: string;
    description: string;
    templateIds: string[];
}

// --- Categories (10 大カテゴリ) ---
export const CATEGORIES: FrameworkCategory[] = [
    { id: 'analyze', icon: '🔍', label: '現状を見せる', description: '今の状況・環境を整理して見せる' },
    { id: 'compare', icon: '⚖️', label: '比べて選ぶ', description: '選択肢を比較し優先順位をつける' },
    { id: 'decompose', icon: '🌳', label: '分解して考える', description: '問題を構造的に分解する' },
    { id: 'flow', icon: '🔄', label: '流れを見せる', description: 'プロセスや体験の流れを表現する' },
    { id: 'plan', icon: '📅', label: '計画を見せる', description: '時間軸に沿った計画を見せる' },
    { id: 'change', icon: '✨', label: '変化を見せる', description: '導入前後の変化・効果を対比する' },
    { id: 'people', icon: '👥', label: '関係者を見せる', description: '人・チームの関係性と役割を見せる' },
    { id: 'business', icon: '🏢', label: '事業全体を見せる', description: 'ビジネスモデルや事業構造を1枚で表現' },
    { id: 'tech', icon: '🖥️', label: '技術を見せる', description: 'システム構成・技術アーキテクチャを表現' },
    { id: 'numbers', icon: '📊', label: '数字を見せる', description: '定量データを効果的にビジュアライズ' },
];

// --- Templates (主要テンプレート) ---
export const TEMPLATES: FrameworkTemplate[] = [
    // 🔍 現状を見せる
    { id: 'as-is-to-be', categoryId: 'analyze', label: 'As-Is / To-Be', description: '現状と理想のギャップを可視化', layoutHint: 'two-columnまたはcomparisonで左右対比。左に「As-Is（現状）」、右に「To-Be（理想）」を配置し、中央に矢印を示すイメージ' },
    { id: 'swot', categoryId: 'analyze', label: 'SWOT分析', description: '強み・弱み・機会・脅威の4象限', layoutHint: 'two-columnを2枚使い、4象限を表現。1枚目:「強み」vs「弱み」、2枚目:「機会」vs「脅威」' },
    { id: '3c', categoryId: 'analyze', label: '3C分析', description: '自社・顧客・競合の関係整理', layoutHint: 'contentで3つの観点（Company/Customer/Competitor）を整理。各Cをbulletsで具体的に記述' },
    { id: 'pest', categoryId: 'analyze', label: 'PEST分析', description: '政治・経済・社会・技術の外部環境', layoutHint: 'two-columnを2枚使用。1枚目: Political vs Economic、2枚目: Social vs Technological' },
    { id: '5forces', categoryId: 'analyze', label: '5 Forces', description: '業界の競争構造分析', layoutHint: 'contentで5つの競争要因を列挙。中央に「業界内競争」、上下左右に「新規参入」「代替品」「買い手」「売り手」の力関係をbulletsで整理' },
    { id: 'value-chain', categoryId: 'analyze', label: 'バリューチェーン', description: '事業活動の価値連鎖を可視化', layoutHint: 'contentで主活動と支援活動を段階的に列挙。各活動の付加価値ポイントをbulletsで記述' },
    { id: 'ponchie', categoryId: 'analyze', label: '霞ヶ関ポンチ絵', description: '情報密度高の官公庁スタイル説明図', layoutHint: 'contentとtwo-columnを組み合わせて情報を高密度に配置。箇条書きを多用し、全体像を1〜2枚で表現' },
    { id: 'infographic', categoryId: 'analyze', label: 'インフォグラフィック', description: 'データ・実績を図解で表現', layoutHint: 'image-textでキーナンバーを大きく表示し、chartで補足データを可視化。視覚的インパクト重視' },

    // ⚖️ 比べて選ぶ
    { id: 'matrix-2x2', categoryId: 'compare', label: '2×2マトリクス', description: '2軸で選択肢を分類・優先順位付け', layoutHint: 'two-columnで縦軸を分割し、各セルの内容をbulletsで記述。軸ラベルをheaderに明記' },
    { id: 'urgency-importance', categoryId: 'compare', label: '重要度×緊急度', description: 'タスク優先順位の可視化', layoutHint: 'two-columnで「重要&緊急」vs「重要&非緊急」、次の枚で「非重要&緊急」vs「非重要&非緊急」' },
    { id: 'pros-cons', categoryId: 'compare', label: 'プロコン表', description: '賛否の論点を並列整理', layoutHint: 'comparisonで左「メリット/Pros」vs 右「デメリット/Cons」を対比' },
    { id: 'payoff-matrix', categoryId: 'compare', label: 'ペイオフマトリクス', description: '効果×実現難易度で施策を仕分け', layoutHint: 'two-columnで「効果大&容易（Quick Win）」vs「効果大&難（戦略的投資）」。4象限をchart棒グラフで補完可能' },
    { id: 'scoring', categoryId: 'compare', label: 'スコアリング表', description: '複数基準で定量的に比較', layoutHint: 'contentで評価項目と点数を表形式で列挙。合計スコアをimage-textのkeyNumberで強調' },
    { id: 'comparison-table', categoryId: 'compare', label: '比較表・マトリクス図', description: '製品/サービスの視覚的比較', layoutHint: 'comparisonで2つの選択肢を対比。3つ以上ならcontentで表形式bulletsを使用' },

    // 🌳 分解して考える
    { id: 'logic-tree', categoryId: 'decompose', label: 'ロジックツリー', description: '課題を階層的にMECE分解', layoutHint: 'contentで上位から下位へ段階的にbulletsで展開。インデントで階層を表現' },
    { id: 'kpi-tree', categoryId: 'decompose', label: 'KPIツリー', description: 'KGI→KPI→KDIの因数分解', layoutHint: 'contentで最上位のKGI、次にKPIをbullets、さらにKDIを次スライドのbulletsで展開。image-textでkeyNumberにKGI値' },
    { id: 'pyramid', categoryId: 'decompose', label: 'ピラミッドストラクチャー', description: '結論→根拠→事実の論理構造', layoutHint: 'contentで最初のbulletに結論、続くbulletsで根拠を列挙。次スライドで各根拠の裏付け事実を展開' },
    { id: 'fishbone', categoryId: 'decompose', label: 'フィッシュボーン', description: '問題の原因を体系的に洗い出す', layoutHint: 'contentで中心課題をタイトルに、6つの原因カテゴリ（人・方法・機械・材料・測定・環境）をbulletsで列挙' },

    // 🔄 流れを見せる
    { id: 'process-flow', categoryId: 'flow', label: '業務フロー図', description: '業務プロセスの一連の流れ', layoutHint: 'contentで各ステップを番号付きbulletsで表現。ステップ間の判断ポイントはtwo-columnで分岐を表現' },
    { id: 'swimlane', categoryId: 'flow', label: 'スイムレーン図', description: '複数担当者間の業務の流れ', layoutHint: 'two-columnで担当者ごとにレーンを分け、各レーン内のタスクをbulletsで時系列表示' },
    { id: 'funnel', categoryId: 'flow', label: 'ファネル', description: 'CVR等の各段階の歩留まり', layoutHint: 'chartの棒グラフで各段階の数値を表示。image-textでCVR等のkeyNumberを強調' },
    { id: 'customer-journey', categoryId: 'flow', label: 'カスタマージャーニー', description: 'ユーザー体験の流れと感情曲線', layoutHint: 'contentで各フェーズをbulletsで表現。フェーズごとに「行動」「思考」「感情」「タッチポイント」を整理' },

    // 📅 計画を見せる
    { id: 'roadmap', categoryId: 'plan', label: 'ロードマップ', description: '時系列のマイルストーン計画', layoutHint: 'contentで時期ごとにフェーズを区切り、各フェーズのタスクをbulletsで列挙。image-textで目標期日をkeyNumberに' },
    { id: 'okr', categoryId: 'plan', label: 'OKR', description: '目標と成果指標のツリー', layoutHint: 'contentでObjectiveをタイトルに、Key Resultsをbulletsで3〜5個列挙。image-textでkeyNumberに達成率' },
    { id: 'ansoff', categoryId: 'plan', label: 'アンゾフマトリクス', description: '成長戦略の方向性（市場×製品）', layoutHint: 'two-columnで「既存市場」vs「新市場」×「既存製品」vs「新製品」の4戦略を表現' },

    // ✨ 変化を見せる
    { id: 'before-after', categoryId: 'change', label: 'Before / After', description: '導入前後の変化を対比', layoutHint: 'comparisonで左「Before」vs右「After」。定量的な変化はimage-textのkeyNumberで強調' },
    { id: 'gap-analysis', categoryId: 'change', label: 'ギャップ分析', description: '目標と現状の差を可視化', layoutHint: 'chartの棒グラフで目標値と現状値を並列表示。ギャップをimage-textのkeyNumberで強調' },
    { id: 'impact-sim', categoryId: 'change', label: '導入効果シミュレーション', description: '定量的な改善効果の試算', layoutHint: 'image-textでkeyNumberに効果金額/率を表示。bulletsで前提条件と算出根拠を記載' },
    { id: 'maturity', categoryId: 'change', label: '成熟度モデル', description: '現在地と目標レベルの5段階可視化', layoutHint: 'contentで5段階を番号付きbulletsで列挙。現在地をimage-textのkeyNumberで「Lv.X」として強調' },

    // 👥 関係者を見せる
    { id: 'stakeholder', categoryId: 'people', label: 'ステークホルダーマップ', description: '関係者の影響力・関心度マッピング', layoutHint: 'two-columnで「高影響力」vs「低影響力」に分け、各bulletsに関係者名と役割を記載' },
    { id: 'raci', categoryId: 'people', label: 'RACI図', description: '誰が何を担当するかの責任分担', layoutHint: 'contentで表形式をbulletsで表現。タスクごとにR(実行)/A(説明責任)/C(相談)/I(報告)を明記' },
    { id: 'org-chart', categoryId: 'people', label: '組織図', description: 'チーム構成・レポートライン', layoutHint: 'contentで階層構造をインデント付きbulletsで表現。トップをタイトルに、各部門をbulletsで列挙' },

    // 🏢 事業全体を見せる
    { id: 'bmc', categoryId: 'business', label: 'ビジネスモデルキャンバス', description: '事業モデルの9要素を整理', layoutHint: '複数枚のtwo-columnで9ブロックを表現。VP/CS/CHを1枚、KA/KR/KPを1枚、CR/RS/C$を1枚' },
    { id: 'lean-canvas', categoryId: 'business', label: 'リーンキャンバス', description: 'スタートアップ向け事業仮説', layoutHint: 'two-columnで「課題」vs「解決策」、「独自の価値提案」をimage-textで強調、「顧客セグメント」vs「チャネル」' },
    { id: 'biz-model-diagram', categoryId: 'business', label: 'ビジネスモデル図', description: '収益の流れ・ステークホルダー関係', layoutHint: 'contentでプレイヤー間の価値交換をbulletsで図解的に記述。矢印表現（→）を活用' },

    // 🖥️ 技術を見せる
    { id: 'system-arch', categoryId: 'tech', label: 'システム構成図', description: 'サーバー・DB・API関係図', layoutHint: 'contentでレイヤーごとにコンポーネントをbulletsで列挙。フロント/バック/DB/外部APIの4層構造' },
    { id: 'sequence', categoryId: 'tech', label: 'シーケンス図', description: 'API通信・システム間のやり取り', layoutHint: 'contentでアクターとメッセージを時系列にbulletsで「A→B: メッセージ」形式で表現' },

    // 📊 数字を見せる
    { id: 'waterfall', categoryId: 'numbers', label: 'ウォーターフォールチャート', description: '増減の内訳を段階的に表示', layoutHint: 'chartの棒グラフで各項目の増減を表現。初期値→増分→減分→最終値の流れ' },
    { id: 'pareto', categoryId: 'numbers', label: 'パレート図', description: '重点項目の特定（80:20の法則）', layoutHint: 'chartの棒グラフで降順に並べ、上位20%が全体の80%を占めることを示す。image-textで分岐点をkeyNumberに' },
];

// --- Preset Combos (7種) ---
export const PRESET_COMBOS: PresetCombo[] = [
    {
        id: 'proposal',
        icon: '🎯',
        name: '課題提案セット',
        description: 'As-Is/To-Be → ロジックツリー → ペイオフ → ロードマップ',
        templateIds: ['as-is-to-be', 'logic-tree', 'payoff-matrix', 'roadmap'],
    },
    {
        id: 'improvement',
        icon: '📈',
        name: '改善提案セット',
        description: 'ファネル → Before/After → 導入効果 → ロードマップ',
        templateIds: ['funnel', 'before-after', 'impact-sim', 'roadmap'],
    },
    {
        id: 'business-plan',
        icon: '🏢',
        name: '事業計画セット',
        description: '3C → SWOT → BMC → ロードマップ',
        templateIds: ['3c', 'swot', 'bmc', 'roadmap'],
    },
    {
        id: 'ai-adoption',
        icon: '🤖',
        name: 'AI導入提案セット',
        description: 'As-Is/To-Be → 業務フロー → ペイオフ → B/A → ロードマップ',
        templateIds: ['as-is-to-be', 'process-flow', 'payoff-matrix', 'before-after', 'roadmap'],
    },
    {
        id: 'self-intro',
        icon: '👤',
        name: '自己紹介セット',
        description: 'インフォグラフィック → バリューチェーン → KPIツリー → B/A',
        templateIds: ['infographic', 'value-chain', 'kpi-tree', 'before-after'],
    },
    {
        id: 'tech-proposal',
        icon: '🔧',
        name: '技術提案セット',
        description: 'システム構成図 → シーケンス → B/A → ロードマップ',
        templateIds: ['system-arch', 'sequence', 'before-after', 'roadmap'],
    },
    {
        id: 'exec-report',
        icon: '📊',
        name: '経営報告セット',
        description: 'KPIツリー → ウォーターフォール → ファネル → ロードマップ',
        templateIds: ['kpi-tree', 'waterfall', 'funnel', 'roadmap'],
    },
];

// --- Helper functions ---

/** カテゴリIDに属するテンプレート一覧を取得 */
export function getTemplatesByCategory(categoryId: string): FrameworkTemplate[] {
    return TEMPLATES.filter((t) => t.categoryId === categoryId);
}

/** テンプレートIDからテンプレート情報を取得 */
export function getTemplateById(templateId: string): FrameworkTemplate | undefined {
    return TEMPLATES.find((t) => t.id === templateId);
}

/** 選択されたテンプレートからAIプロンプト用のテキストを生成 */
export function buildTemplatePromptSection(templateIds: string[]): string {
    if (templateIds.length === 0) return '';

    const selected = templateIds
        .map((id) => getTemplateById(id))
        .filter((t): t is FrameworkTemplate => t !== undefined);

    if (selected.length === 0) return '';

    const lines = selected.map(
        (t, i) => `${i + 1}. **${t.label}** — ${t.description}\n   レイアウトヒント: ${t.layoutHint}`
    );

    return `\n\n## スライド構成テンプレート指示:
ユーザーは以下のフレームワーク/テンプレートを使ったスライド構成を希望しています：
${lines.join('\n')}

**重要な指示:**
- 上記のフレームワークを中心にスライドを構成してください
- 各フレームワークに最低1枚のスライドを割り当ててください
- フレームワーク以外に、title（表紙）、agenda（目次）、summary（まとめ）を適宜追加してください
- レイアウトヒントを参考に、最適なSlideTypeを選択してください
- フレームワーク同士の論理的な流れ（ストーリーライン）を意識してください`;
}
