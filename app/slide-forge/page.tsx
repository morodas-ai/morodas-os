'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Sparkles, Download, FileSpreadsheet, X, AlertCircle, Layers, Image as ImageIcon, Cpu, RefreshCw, FileText, ChevronDown, LayoutTemplate, ClipboardPaste, History, Trash2, Edit3, Globe, Send, Camera, Palette, Plus, Minus, Save, MessageCircle, FileImage } from 'lucide-react';
import {
  ParsedExcel,
  SlideData,
  GenerationMode,
  DesignComplexity,
  AiModel,
} from '@/lib/slide-forge/types';
import { getTheme, getThemeNames, THEMES } from '@/lib/slide-forge/themes';
import { CATEGORIES, TEMPLATES, PRESET_COMBOS, getTemplatesByCategory, getTemplateById } from '@/lib/slide-forge/templateCatalog';
import { BrandKit, loadBrandKits, saveBrandKit, deleteBrandKit, brandKitToThemeColors, DEFAULT_BRAND_KIT } from '@/lib/slide-forge/brandKit';

type AppState = 'idle' | 'uploaded' | 'generating' | 'done' | 'error';

export default function HomePage() {
  // App state
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string>('');

  // Upload state
  const [excelData, setExcelData] = useState<ParsedExcel | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<'excel' | 'text' | 'url'>('excel');
  const [rawText, setRawText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // Config state
  const [mode, setMode] = useState<GenerationMode>('expand');
  const [pageCount, setPageCount] = useState(10);
  const [complexity, setComplexity] = useState<DesignComplexity>('standard');
  const [themeName, setThemeName] = useState('corporate-blue');
  const [designPrompt, setDesignPrompt] = useState('');
  const [aiModel, setAiModel] = useState<AiModel>('gemini-3-pro-preview');

  // Template selection
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [templateMode, setTemplateMode] = useState<'preset' | 'custom'>('preset');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Reference images
  const [refImages, setRefImages] = useState<{ file: File; preview: string; description: string }[]>([]);

  // Result state
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [svgs, setSvgs] = useState<string[]>([]);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  // Slide editing
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);

  // AI Chat
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Brand Kit
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);

  // History (LocalStorage)
  interface HistoryEntry {
    id: string;
    title: string;
    timestamp: number;
    slideCount: number;
    slides: SlideData[];
    svgs: string[];
  }
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history + saved settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slideforge-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
    try {
      const cfg = localStorage.getItem('slideforge-config');
      if (cfg) {
        const c = JSON.parse(cfg);
        if (c.mode) setMode(c.mode);
        if (c.pageCount) setPageCount(c.pageCount);
        if (c.complexity) setComplexity(c.complexity);
        if (c.themeName) setThemeName(c.themeName);
        if (c.aiModel) setAiModel(c.aiModel);
        if (c.inputMode) setInputMode(c.inputMode);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('slideforge-config', JSON.stringify({
        mode, pageCount, complexity, themeName, aiModel, inputMode,
      }));
    } catch { /* ignore */ }
  }, [mode, pageCount, complexity, themeName, aiModel, inputMode]);

  // Save to history when slides are generated
  const saveToHistory = useCallback((newSlides: SlideData[], newSvgs: string[]) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      title: newSlides[0]?.title || '無題のプレゼン',
      timestamp: Date.now(),
      slideCount: newSlides.length,
      slides: newSlides,
      svgs: newSvgs,
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 10); // Keep last 10
      try {
        localStorage.setItem('slideforge-history', JSON.stringify(updated));
      } catch { /* quota exceeded — trim */ }
      return updated;
    });
  }, []);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setSlides(entry.slides);
    setSvgs(entry.svgs);
    setAppState('done');
    setShowHistory(false);
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('slideforge-history', JSON.stringify(updated));
      } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/slide-forge/parse-excel', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setExcelData(json.data);
        setAppState('uploaded');
      } else {
        setError(json.error || 'ファイルの解析に失敗しました');
        setAppState('error');
      }
    } catch {
      setError('ファイルのアップロードに失敗しました');
      setAppState('error');
    }
  }, []);

  // Text paste → ParsedExcel conversion
  const handleTextSubmit = useCallback(() => {
    if (!rawText.trim()) return;
    const lines = rawText.trim().split('\n').filter((l) => l.trim());
    const parsedExcel: ParsedExcel = {
      fileName: 'テキスト入力',
      sheets: [{
        name: 'テキスト',
        headers: ['内容'],
        rows: lines.map((line) => ({ '内容': line })),
        rowCount: lines.length,
      }],
      textSummary: rawText.trim(),
    };
    setExcelData(parsedExcel);
    setAppState('uploaded');
  }, [rawText]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  // Reference image upload (max 5)
  const MAX_REF_IMAGES = 5;
  const handleRefImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setRefImages((prev) => {
      const remaining = MAX_REF_IMAGES - prev.length;
      if (remaining <= 0) return prev;
      const toAdd = files.slice(0, remaining);
      const newImages = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        description: '',
      }));
      return [...prev, ...newImages];
    });
    // Reset input
    e.target.value = '';
  }, []);

  const updateRefImageDescription = useCallback((index: number, description: string) => {
    setRefImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, description } : img))
    );
  }, []);

  const removeRefImage = useCallback((index: number) => {
    setRefImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Generate slides
  const handleGenerate = useCallback(async () => {
    if (!excelData) return;
    setAppState('generating');
    setError('');

    try {
      // Convert uploaded images to base64 data URLs
      const referenceImages = await Promise.all(
        refImages.map(async (img) => {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(img.file);
          });
          return { dataUrl, description: img.description };
        })
      );

      const res = await fetch('/api/slide-forge/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excelData,
          config: { mode, pageCount, complexity, designPrompt, themeName, aiModel, selectedTemplates: selectedTemplates.length > 0 ? selectedTemplates : undefined },
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSlides(json.slides);
        setSvgs(json.svgs);
        setAppState('done');
        saveToHistory(json.slides, json.svgs);
      } else {
        setError(json.error || 'スライド生成に失敗しました');
        setAppState('error');
      }
    } catch {
      setError('スライド生成中にエラーが発生しました');
      setAppState('error');
    }
  }, [excelData, mode, pageCount, complexity, designPrompt, themeName, aiModel, refImages, selectedTemplates]);

  // Export PPTX
  const handleExportPptx = useCallback(async () => {
    if (slides.length === 0) return;

    try {
      const theme = getTheme(themeName, complexity);
      const title = excelData?.fileName.replace(/\.(xlsx|xls|csv)$/i, '') || 'Presentation';

      const res = await fetch('/api/slide-forge/export-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, theme, title }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('PPTXのエクスポートに失敗しました');
    }
  }, [slides, themeName, complexity, excelData]);

  // Regenerate single slide
  const handleRegenerateSlide = useCallback(async (index: number) => {
    if (!excelData || regeneratingIndex !== null) return;
    setRegeneratingIndex(index);

    try {
      const res = await fetch('/api/slide-forge/regenerate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slide: slides[index],
          allSlides: slides,
          excelData,
          config: { mode, pageCount, complexity, designPrompt, themeName, aiModel, selectedTemplates: selectedTemplates.length > 0 ? selectedTemplates : undefined },
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSlides((prev) => {
          const updated = [...prev];
          updated[index] = json.slide;
          return updated;
        });
        setSvgs((prev) => {
          const updated = [...prev];
          updated[index] = json.svg;
          return updated;
        });
      } else {
        setError(json.error || 'スライドの再生成に失敗しました');
      }
    } catch {
      setError('スライドの再生成中にエラーが発生しました');
    } finally {
      setRegeneratingIndex(null);
    }
  }, [slides, excelData, regeneratingIndex, mode, pageCount, complexity, designPrompt, themeName, aiModel, selectedTemplates]);

  // Reset
  const handleReset = () => {
    setAppState('idle');
    setExcelData(null);
    setSlides([]);
    setSvgs([]);
    setRefImages([]);
    setSelectedTemplates([]);
    setActivePresetId(null);
    setExpandedCategory(null);
    setError('');
    setChatMessages([]);
  };

  // URL → ParsedExcel
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setError('');
    try {
      const res = await fetch('/api/slide-forge/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setExcelData(json.data);
        setAppState('uploaded');
      } else {
        setError(json.error || 'URLの解析に失敗しました');
      }
    } catch {
      setError('URLの解析に失敗しました');
    } finally {
      setUrlLoading(false);
    }
  }, [urlInput]);

  // Slide editing
  const openSlideEditor = useCallback((index: number) => {
    setEditingSlideIndex(index);
    setEditingSlide({ ...slides[index], bullets: [...(slides[index].bullets || [])] });
  }, [slides]);

  const saveSlideEdit = useCallback(() => {
    if (editingSlide === null || editingSlideIndex === null) return;
    const theme = getTheme(themeName, complexity);
    // Update slides
    setSlides(prev => {
      const updated = [...prev];
      updated[editingSlideIndex] = editingSlide;
      return updated;
    });
    // Regenerate SVG for this slide
    import('@/lib/slide-forge/svgEngine').then(({ generateSlideSVG }) => {
      const newSvg = generateSlideSVG(editingSlide, theme, slides.length);
      setSvgs(prev => {
        const updated = [...prev];
        updated[editingSlideIndex!] = newSvg;
        return updated;
      });
    });
    setEditingSlideIndex(null);
    setEditingSlide(null);
  }, [editingSlide, editingSlideIndex, themeName, complexity, slides.length]);

  // Image export (SVG download)
  const handleExportSvg = useCallback((index: number) => {
    const svg = svgs[index];
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slide_${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgs]);

  // Image export (PNG download via Canvas)
  const handleExportPng = useCallback((index: number) => {
    const svg = svgs[index];
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1920, 1080);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `slide_${index + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [svgs]);

  // PDF export
  const handleExportPdf = useCallback(async () => {
    if (svgs.length === 0) return;
    try {
      const title = excelData?.fileName.replace(/\.(xlsx|xls|csv|url)$/i, '') || 'Presentation';
      const res = await fetch('/api/slide-forge/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svgs, title }),
      });
      const json = await res.json();
      if (json.success) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(json.html);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      } else {
        setError(json.error || 'PDF生成に失敗しました');
      }
    } catch {
      setError('PDF出力に失敗しました');
    }
  }, [svgs, excelData]);

  // AI Chat — send message to modify slides
  const handleChatSend = useCallback(async () => {
    if (!chatInput.trim() || chatLoading || slides.length === 0) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/slide-forge/chat-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          slides,
          config: { mode, pageCount, complexity, designPrompt, themeName, aiModel },
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSlides(json.slides);
        setSvgs(json.svgs);
        setChatMessages(prev => [...prev, { role: 'ai', text: json.summary || '修正しました' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: `エラー: ${json.error}` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'エラー: 修正に失敗しました' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [chatInput, chatLoading, slides, mode, pageCount, complexity, designPrompt, themeName, aiModel]);

  // Brand Kit management
  useEffect(() => {
    setBrandKits(loadBrandKits());
  }, []);

  const handleSaveBrandKit = useCallback(() => {
    if (!editingBrandKit) return;
    const kit = { ...editingBrandKit };
    if (!kit.id) {
      kit.id = Date.now().toString();
      kit.createdAt = Date.now();
    }
    if (!kit.name.trim()) {
      kit.name = 'ブランドキット ' + (brandKits.length + 1);
    }
    setBrandKits(saveBrandKit(kit));
    setEditingBrandKit(null);
  }, [editingBrandKit, brandKits.length]);

  const handleDeleteBrandKit = useCallback((id: string) => {
    setBrandKits(deleteBrandKit(id));
  }, []);

  const applyBrandKit = useCallback((kit: BrandKit) => {
    const colors = brandKitToThemeColors(kit);
    // We apply the brand kit as a custom theme by updating the theme state
    // For now, we create a temporary theme entry
    THEMES['brand-custom'] = {
      name: kit.name || 'カスタムブランド',
      colors,
      fonts: { title: kit.fontFamily || 'Noto Sans JP', body: kit.fontFamily || 'Noto Sans JP' },
      complexity: 'standard',
    };
    setThemeName('brand-custom');
    setShowBrandKit(false);
  }, []);

  const themeNames = getThemeNames();
  const isGenerating = appState === 'generating';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            <Layers size={24} color="#fff" />
          </div>
          <div>
            <h1>SlideForge</h1>
            <p className="subtitle">Excel → AI → 美しいプレゼン資料</p>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner fade-in">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            className="file-remove"
            onClick={() => setError('')}
            style={{ marginLeft: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Data Input */}
      <div className="section fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>
            <Upload size={20} className="icon" />
            データ入力
          </h2>
          <div style={{ display: 'flex', gap: 0 }}>
            {history.length > 0 && (
              <button
                className="btn-history-toggle"
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '6px 12px', fontSize: 12, fontFamily: 'inherit',
                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 6, marginRight: 8,
                }}
                onClick={() => setShowHistory(!showHistory)}
              >
                <History size={14} />
                履歴 ({history.length})
              </button>
            )}
          </div>
        </div>

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div style={{
            marginBottom: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 16, maxHeight: 300, overflowY: 'auto',
          }} className="fade-in">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>最近の生成履歴（最大10件）</div>
            {history.map((entry) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)',
                borderBottom: '1px solid var(--border)',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,92,56,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => loadFromHistory(entry)}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {entry.slideCount}枚 ・ {new Date(entry.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                  onClick={(e) => { e.stopPropagation(); deleteFromHistory(entry.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Mode Toggle */}
        {!excelData && (
          <div className="template-toggle" style={{ marginBottom: 16, width: 'fit-content' }}>
            <button
              className={`template-toggle-btn ${inputMode === 'excel' ? 'active' : ''}`}
              onClick={() => setInputMode('excel')}
            >
              <FileSpreadsheet size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
              Excelアップロード
            </button>
            <button
              className={`template-toggle-btn ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => setInputMode('text')}
            >
              <ClipboardPaste size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
              テキスト入力
            </button>
            <button
              className={`template-toggle-btn ${inputMode === 'url' ? 'active' : ''}`}
              onClick={() => setInputMode('url')}
            >
              <Globe size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
              URL
            </button>
          </div>
        )}

        {!excelData ? (
          inputMode === 'excel' ? (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="upload-icon">📊</div>
              <p className="upload-text">
                ここにExcelファイルをドラッグ＆ドロップ
              </p>
              <p className="upload-hint">またはクリックしてファイルを選択（.xlsx）</p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>
          ) : inputMode === 'text' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                className="design-textarea"
                style={{ minHeight: 160 }}
                placeholder={'プレゼンの内容をテキストで入力\n\n例:\n・2024年の売上は4300万円\n・前年比13%成長\n・来年度は5000万円を目標\n・新規顧客獲得が成長ドライバー'}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
                disabled={!rawText.trim()}
                onClick={handleTextSubmit}
              >
                <ClipboardPaste size={18} />
                このテキストで作成
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="url"
                  className="design-textarea"
                  style={{ flex: 1, minHeight: 'auto', padding: '12px 16px' }}
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <button
                  className="btn btn-primary"
                  disabled={!urlInput.trim() || urlLoading}
                  onClick={handleUrlSubmit}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {urlLoading ? (
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                  ) : (
                    <Globe size={18} />
                  )}
                  {urlLoading ? '解析中...' : 'URLから作成'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                WebページのURLを入力すると、内容を自動抽出してスライドを作成します
              </p>
            </div>
          )
        ) : (
          <div className="file-info fade-in">
            <FileSpreadsheet size={24} className="file-icon" />
            <div className="file-details">
              <div className="file-name">{excelData.fileName}</div>
              <div className="file-meta">
                {excelData.sheets.length}シート・
                {excelData.sheets.reduce((a, s) => a + s.rowCount, 0)}行
              </div>
            </div>
            <button className="file-remove" onClick={handleReset}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Configuration */}
      <div className="section fade-in fade-in-delay-1">
        <h2 className="section-title">
          <Sparkles size={20} className="icon" />
          生成設定
        </h2>

        <div className="config-grid">
          {/* Mode selector */}
          <div className="config-card">
            <label className="config-label">作成モード</label>
            <div className="mode-selector">
              <div
                className={`mode-option ${mode === 'expand' ? 'active' : ''}`}
                onClick={() => setMode('expand')}
              >
                <div className="mode-name">🧠 拡充モード</div>
                <div className="mode-desc">AIが内容を膨らませて構成</div>
              </div>
              <div
                className={`mode-option ${mode === 'split' ? 'active' : ''}`}
                onClick={() => setMode('split')}
              >
                <div className="mode-name">✂️ 分割のみ</div>
                <div className="mode-desc">入力内容をそのまま分割</div>
              </div>
            </div>
          </div>

          {/* AI Model selector */}
          <div className="config-card">
            <label className="config-label">
              <Cpu size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
              AIモデル
            </label>
            <div className="mode-selector" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div
                className={`mode-option ${aiModel === 'gemini-2.0-flash' ? 'active' : ''}`}
                onClick={() => setAiModel('gemini-2.0-flash')}
              >
                <div className="mode-name">⚡ Flash</div>
                <div className="mode-desc">高速・無料枠</div>
              </div>
              <div
                className={`mode-option ${aiModel === 'gemini-2.5-pro' ? 'active' : ''}`}
                onClick={() => setAiModel('gemini-2.5-pro')}
              >
                <div className="mode-name">💎 2.5 Pro</div>
                <div className="mode-desc">高品質</div>
              </div>
              <div
                className={`mode-option ${aiModel === 'gemini-3-pro-preview' ? 'active' : ''}`}
                onClick={() => setAiModel('gemini-3-pro-preview')}
              >
                <div className="mode-name">🚀 3.0 Pro</div>
                <div className="mode-desc">最高品質・Vertex</div>
              </div>
            </div>
          </div>

          {/* Page count — discrete buttons */}
          <div className="config-card">
            <label className="config-label">ページ数</label>
            <div className="page-count-selector">
              {[1, 5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  className={`page-count-btn ${pageCount === count ? 'active' : ''}`}
                  onClick={() => setPageCount(count)}
                >
                  {count}枚
                </button>
              ))}
            </div>
          </div>

          {/* Design complexity */}
          <div className="config-card">
            <label className="config-label">デザインの複雑さ</label>
            <div className="complexity-selector">
              {(
                [
                  { key: 'simple', icon: '⚡', label: 'シンプル', desc: 'テキスト中心・装飾なし' },
                  { key: 'standard', icon: '✨', label: 'スタンダード', desc: 'アクセント・影・軽い装飾' },
                  { key: 'rich', icon: '💎', label: 'リッチ', desc: 'グラデーション・図形・高装飾' },
                ] as const
              ).map((opt) => (
                <div
                  key={opt.key}
                  className={`complexity-option ${complexity === opt.key ? 'active' : ''}`}
                  onClick={() => setComplexity(opt.key)}
                >
                  <div className="complexity-icon">{opt.icon}</div>
                  {opt.label}
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="config-card">
            <label className="config-label">テーマカラー</label>
            <div className="theme-selector">
              {themeNames.map((t) => (
                <div
                  key={t.key}
                  className={`theme-swatch ${themeName === t.key ? 'active' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${THEMES[t.key].colors.primary}, ${THEMES[t.key].colors.secondary})`,
                  }}
                  onClick={() => setThemeName(t.key)}
                  title={t.name}
                >
                  <span className="swatch-name">{t.name}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary"
              style={{ marginTop: 8, padding: '6px 12px', fontSize: 12, width: 'auto' }}
              onClick={() => setShowBrandKit(true)}
            >
              <Palette size={14} />
              ブランドキット
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="config-card template-section" style={{ marginTop: 24 }}>
          <div className="template-section-header">
            <label className="template-section-title">
              <LayoutTemplate size={16} />
              スライド構成テンプレート（任意）
            </label>
            <div className="template-toggle">
              <button
                className={`template-toggle-btn ${templateMode === 'preset' ? 'active' : ''}`}
                onClick={() => setTemplateMode('preset')}
              >
                セット提案
              </button>
              <button
                className={`template-toggle-btn ${templateMode === 'custom' ? 'active' : ''}`}
                onClick={() => setTemplateMode('custom')}
              >
                カスタム選択
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            フレームワーク・テンプレートを選ぶと、AIがその構成に沿ったスライドを生成します。未選択でも自動構成されます。
          </p>

          {templateMode === 'preset' ? (
            <div className="preset-scroll">
              {PRESET_COMBOS.map((combo) => (
                <div
                  key={combo.id}
                  className={`preset-card ${activePresetId === combo.id ? 'active' : ''}`}
                  onClick={() => {
                    if (activePresetId === combo.id) {
                      setActivePresetId(null);
                      setSelectedTemplates([]);
                    } else {
                      setActivePresetId(combo.id);
                      setSelectedTemplates([...combo.templateIds]);
                    }
                  }}
                >
                  <div className="preset-card-icon">{combo.icon}</div>
                  <div className="preset-card-name">{combo.name}</div>
                  <div className="preset-card-desc">{combo.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="category-list">
              {CATEGORIES.map((cat) => {
                const catTemplates = getTemplatesByCategory(cat.id);
                const isOpen = expandedCategory === cat.id;
                const selectedInCat = catTemplates.filter((t) => selectedTemplates.includes(t.id)).length;
                return (
                  <div key={cat.id}>
                    <div
                      className={`category-header ${isOpen ? 'open' : ''}`}
                      onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-label">{cat.label}</span>
                      <span className="category-desc">{cat.description}</span>
                      {selectedInCat > 0 && (
                        <span className="category-count">{selectedInCat}選択</span>
                      )}
                      <ChevronDown size={16} className={`category-chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                    {isOpen && (
                      <div className="category-templates fade-in">
                        {catTemplates.map((tmpl) => {
                          const isChecked = selectedTemplates.includes(tmpl.id);
                          return (
                            <div
                              key={tmpl.id}
                              className="template-item"
                              onClick={() => {
                                setActivePresetId(null);
                                setSelectedTemplates((prev) =>
                                  isChecked
                                    ? prev.filter((id) => id !== tmpl.id)
                                    : [...prev, tmpl.id]
                                );
                              }}
                            >
                              <div className={`template-checkbox ${isChecked ? 'checked' : ''}`}>
                                {isChecked ? '✓' : ''}
                              </div>
                              <div>
                                <div className="template-label">{tmpl.label}</div>
                                <div className="template-desc">{tmpl.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedTemplates.length > 0 && (
            <div className="selected-badges">
              {selectedTemplates.map((id) => {
                const tmpl = getTemplateById(id);
                if (!tmpl) return null;
                return (
                  <span key={id} className="selected-badge">
                    {tmpl.label}
                    <button onClick={() => {
                      setActivePresetId(null);
                      setSelectedTemplates((prev) => prev.filter((t) => t !== id));
                    }}>×</button>
                  </span>
                );
              })}
              <button
                className="clear-all-btn"
                onClick={() => {
                  setSelectedTemplates([]);
                  setActivePresetId(null);
                }}
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>

        {/* Reference Images */}
        <div className="config-card" style={{ marginTop: 24 }}>
          <label className="config-label">
            <ImageIcon size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
            参考画像（任意）
          </label>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 12px' }}>
            デザインの参考にしたいスライド画像をアップロードできます。スタイルや構成がAI生成に反映されます。
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {refImages.map((img, i) => (
              <div key={i} className="ref-image-card fade-in">
                <div className="ref-image-preview">
                  <img src={img.preview} alt={`参考画像 ${i + 1}`} />
                  <button className="ref-image-remove" onClick={() => removeRefImage(i)}>
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  className="ref-image-desc"
                  placeholder="画像の説明（例: シンプルな棒グラフのスライド）"
                  value={img.description}
                  onChange={(e) => updateRefImageDescription(i, e.target.value)}
                />
              </div>
            ))}

            {refImages.length < 5 && (
              <label className="ref-image-add">
                <ImageIcon size={24} />
                <span>画像を追加</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleRefImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Design prompt - full width */}
        <div className="config-card" style={{ marginTop: 24 }}>
          <label className="config-label">デザインの要望（任意）</label>
          <textarea
            className="design-textarea"
            placeholder="例: 全体的に青色を基調に、データ重視のプレゼンにしてください"
            value={designPrompt}
            onChange={(e) => setDesignPrompt(e.target.value)}
          />
        </div>

        {/* Generate button */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating || !excelData}
            style={{ padding: '16px 64px', fontSize: 18 }}
          >
            <Sparkles size={20} />
            {isGenerating
              ? 'スライド生成中...'
              : 'スライドを生成'}
          </button>
          {aiModel !== 'gemini-2.0-flash' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {aiModel === 'gemini-3-pro-preview'
                ? '🚀 Gemini 3.0 Pro使用（最高品質モデル）'
                : '💎 Gemini 2.5 Pro使用'}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {appState === 'generating' && (
        <div className="loading-overlay fade-in">
          <div className="spinner" />
          <div className="loading-text">AIがスライドを生成中...</div>
          <div className="loading-sub">
            {mode === 'expand'
              ? `${aiModel === 'gemini-3-pro-preview' ? 'Gemini 3.0 Pro' : aiModel === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' : 'Gemini Flash'}がデータを分析し、最適な構成を設計しています`
              : 'データをスライドに分割しています'}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            {['データ分析', '構成設計', 'SVG生成'].map((step, i) => (
              <div key={step} className="loading-step" style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(184,92,56,0.1)', border: '1px solid rgba(184,92,56,0.25)',
                fontSize: 13, color: 'var(--text-muted)',
                animation: `pulse 2s ease-in-out ${i * 0.8}s infinite`,
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Slide Gallery */}
      {appState === 'done' && svgs.length > 0 && (
        <div className="section fade-in fade-in-delay-2">
          <div className="gallery-header">
            <h2 className="section-title">
              <Layers size={20} className="icon" />
              生成されたスライド
            </h2>
            <span className="gallery-count">{svgs.length}枚</span>
          </div>

          <div className="slide-grid">
            {svgs.map((svg, i) => (
              <div key={i} className="slide-card fade-in" style={{
                animationDelay: `${i * 0.05}s`,
                opacity: regeneratingIndex === i ? 0.5 : 1,
                transition: 'opacity 0.3s',
              }}>
                <div className="slide-preview">
                  <span className="slide-number">
                    {i + 1}/{svgs.length}
                  </span>
                  {regeneratingIndex === i && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.5)', borderRadius: 12, zIndex: 10,
                    }}>
                      <div className="spinner" style={{ width: 32, height: 32 }} />
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
                <div className="slide-info">
                  <div className="slide-title">{slides[i]?.title || `スライド ${i + 1}`}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="slide-type">{slides[i]?.type || 'content'}</span>
                    {slides[i]?.notes && (
                      <span title={slides[i].notes} style={{
                        cursor: 'help', display: 'flex', alignItems: 'center',
                        color: 'var(--text-muted)', fontSize: 12,
                      }}>
                        <FileText size={12} style={{ marginRight: 3 }} />
                        ノート
                      </span>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => openSlideEditor(i)}
                        title="このスライドを編集"
                      >
                        <Edit3 size={11} />
                        編集
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => handleExportPng(i)}
                        title="PNG画像として保存"
                      >
                        <Camera size={11} />
                        PNG
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => handleExportSvg(i)}
                        title="SVG画像として保存"
                      >
                        <FileImage size={11} />
                        SVG
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => handleRegenerateSlide(i)}
                        disabled={regeneratingIndex !== null}
                        title="このスライドをAIで再生成"
                      >
                        <RefreshCw size={11} />
                        再生成
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Export actions */}
          <div className="actions-bar">
            <button className="btn btn-success" onClick={handleExportPptx}>
              <Download size={20} />
              PPTXをダウンロード
            </button>
            <button className="btn btn-primary" onClick={handleExportPdf}>
              <FileText size={18} />
              PDF出力
            </button>
            <button className="btn btn-secondary" onClick={handleGenerate}>
              <Sparkles size={18} />
              再生成
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              新しいファイル
            </button>
          </div>

          {/* AI Chat Section */}
          <div className="config-card" style={{ marginTop: 24 }}>
            <label className="config-label">
              <MessageCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
              AIで修正指示（チャット）
            </label>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              自然言語でスライドの修正を指示できます。例：「3枚目の箇条書きを減らして」「全体のトーンをカジュアルに」
            </p>

            {chatMessages.length > 0 && (
              <div style={{
                maxHeight: 200, overflowY: 'auto', marginBottom: 12,
                background: 'var(--bg-body)', borderRadius: 8, padding: 12,
                border: '1px solid var(--border)',
              }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 8,
                  }}>
                    <div style={{
                      maxWidth: '80%', padding: '8px 12px', borderRadius: 12, fontSize: 13,
                      background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? '#fff' : 'var(--text)',
                      border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="design-textarea"
                style={{ flex: 1, minHeight: 'auto', padding: '10px 14px' }}
                placeholder="修正指示を入力..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                disabled={chatLoading}
              />
              <button
                className="btn btn-primary"
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                style={{ whiteSpace: 'nowrap' }}
              >
                {chatLoading ? (
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <Send size={16} />
                )}
                送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Editing Modal */}
      {editingSlide !== null && editingSlideIndex !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 24,
        }} onClick={() => { setEditingSlideIndex(null); setEditingSlide(null); }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: '100%',
            maxWidth: 640, maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                <Edit3 size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
                スライド {editingSlideIndex + 1} を編集
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => { setEditingSlideIndex(null); setEditingSlide(null); }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>タイトル</label>
              <input
                type="text"
                className="design-textarea"
                style={{ width: '100%', minHeight: 'auto', padding: '10px 14px' }}
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
              />
            </div>

            {(editingSlide.type === 'title' || editingSlide.subtitle) && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>サブタイトル</label>
                <input
                  type="text"
                  className="design-textarea"
                  style={{ width: '100%', minHeight: 'auto', padding: '10px 14px' }}
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                />
              </div>
            )}

            {editingSlide.bullets && editingSlide.bullets.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>箇条書き</label>
                {editingSlide.bullets.map((bullet, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input
                      type="text"
                      className="design-textarea"
                      style={{ flex: 1, minHeight: 'auto', padding: '8px 12px', fontSize: 13 }}
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(editingSlide.bullets || [])];
                        newBullets[bi] = e.target.value;
                        setEditingSlide({ ...editingSlide, bullets: newBullets });
                      }}
                    />
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => {
                        const newBullets = (editingSlide.bullets || []).filter((_, j) => j !== bi);
                        setEditingSlide({ ...editingSlide, bullets: newBullets });
                      }}
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12, marginTop: 4 }}
                  onClick={() => setEditingSlide({ ...editingSlide, bullets: [...(editingSlide.bullets || []), ''] })}
                >
                  <Plus size={12} /> 項目を追加
                </button>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>スピーカーノート</label>
              <textarea
                className="design-textarea"
                style={{ width: '100%', minHeight: 80 }}
                value={editingSlide.notes || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setEditingSlideIndex(null); setEditingSlide(null); }}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={saveSlideEdit}>
                <Save size={16} />
                保存して反映
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Kit Modal */}
      {showBrandKit && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 24,
        }} onClick={() => setShowBrandKit(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: '100%',
            maxWidth: 520, maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                <Palette size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 8 }} />
                ブランドキット
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowBrandKit(false)}>
                <X size={20} />
              </button>
            </div>

            {brandKits.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>保存済みキット</div>
                {brandKits.map((kit) => (
                  <div key={kit.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Object.values(kit.colors).map((c, ci) => (
                        <div key={ci} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: '1px solid var(--border)' }} />
                      ))}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{kit.name}</span>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => applyBrandKit(kit)}>
                      適用
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => handleDeleteBrandKit(kit.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingBrandKit ? (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>キット名</label>
                  <input
                    type="text"
                    className="design-textarea"
                    style={{ width: '100%', minHeight: 'auto', padding: '8px 12px' }}
                    placeholder="例: 株式会社MORODAS"
                    value={editingBrandKit.name}
                    onChange={(e) => setEditingBrandKit({ ...editingBrandKit, name: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {(['primary', 'secondary', 'accent', 'background', 'text'] as const).map((colorKey) => (
                    <div key={colorKey}>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                        {colorKey === 'primary' ? 'メインカラー' :
                          colorKey === 'secondary' ? 'サブカラー' :
                            colorKey === 'accent' ? 'アクセント' :
                              colorKey === 'background' ? '背景色' : 'テキスト色'}
                      </label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="color"
                          value={editingBrandKit.colors[colorKey]}
                          onChange={(e) => setEditingBrandKit({
                            ...editingBrandKit,
                            colors: { ...editingBrandKit.colors, [colorKey]: e.target.value },
                          })}
                          style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {editingBrandKit.colors[colorKey]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setEditingBrandKit(null)}>キャンセル</button>
                  <button className="btn btn-primary" onClick={handleSaveBrandKit}>
                    <Save size={14} /> 保存
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setEditingBrandKit({
                  ...DEFAULT_BRAND_KIT,
                  id: '',
                  createdAt: Date.now(),
                } as BrandKit)}
              >
                <Plus size={16} /> 新しいブランドキットを作成
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
