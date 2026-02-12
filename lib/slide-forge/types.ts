// ========================================
// SlideForge — Type Definitions
// ========================================

// --- Excel Parser Types ---
export interface ParsedSheet {
    name: string;
    headers: string[];
    rows: Record<string, string | number | boolean | null>[];
    rowCount: number;
}

export interface ParsedExcel {
    fileName: string;
    sheets: ParsedSheet[];
    textSummary: string; // Flattened text for AI consumption
}

// --- Slide Structure Types ---
export type SlideType =
    | 'title'
    | 'agenda'
    | 'content'
    | 'two-column'
    | 'comparison'
    | 'chart'
    | 'image-text'
    | 'summary';

export type ChartType = 'bar' | 'pie' | 'line';

export interface ChartData {
    labels: string[];
    values: number[];
    colors?: string[];
}

export interface ColumnData {
    header: string;
    items: string[];
}

export interface SlideData {
    index: number;
    type: SlideType;
    title: string;
    subtitle?: string;
    bullets?: string[];
    chartType?: ChartType;
    chartData?: ChartData;
    columns?: ColumnData[];
    notes?: string;
    keyNumber?: string;       // e.g., "¥500億", "12%"
    keyNumberLabel?: string;  // label for the key number
    imageDataUrl?: string;    // base64 data URL for embedded image
}

export interface SlidePresentation {
    title: string;
    slides: SlideData[];
    theme: ThemeConfig;
}

// --- Theme Types ---
export type DesignComplexity = 'simple' | 'standard' | 'rich';

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
}

export interface ThemeConfig {
    name: string;
    colors: ThemeColors;
    fonts: {
        title: string;
        body: string;
    };
    complexity: DesignComplexity;
}

// --- Generation Config ---
export type GenerationMode = 'expand' | 'split';

export type AiModel = 'gemini-2.0-flash' | 'gemini-2.5-pro' | 'gemini-3-pro-preview';

export interface GenerationConfig {
    mode: GenerationMode;
    pageCount: number;
    complexity: DesignComplexity;
    designPrompt?: string;
    themeName?: string;
    aiModel: AiModel;
    selectedTemplates?: string[];  // 選択されたフレームワークテンプレートのID配列
}

// --- API Request/Response ---
export interface ParseExcelResponse {
    success: boolean;
    data?: ParsedExcel;
    error?: string;
}

export interface ReferenceImage {
    dataUrl: string;          // base64 data URL
    description: string;      // user description of the image
}

export interface GenerateSlidesRequest {
    excelData: ParsedExcel;
    config: GenerationConfig;
    referenceImages?: ReferenceImage[];  // actual image data + descriptions
}

export interface GenerateSlidesResponse {
    success: boolean;
    slides?: SlideData[];
    svgs?: string[];
    error?: string;
}

export interface ExportPptxRequest {
    slides: SlideData[];
    theme: ThemeConfig;
    title: string;
}
