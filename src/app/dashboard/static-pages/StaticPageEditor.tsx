"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ComponentType } from "react";
import { useToast } from "../../../components/ui/Toast";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  FileText,
  Highlighter,
  Info,
  Italic,
  Layout,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Plus,
  Save,
  Underline,
} from "lucide-react";

type StaticPageItem = {
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
};

type StaticPageDraft = {
  title: string;
  excerpt: string;
  content: string;
};

type AlignmentMode = "left" | "center" | "right" | "justify";

const DEFAULT_PAGES = [
  { slug: "tentang-kami", title: "Tentang Kami", icon: Info },
  { slug: "visi-misi", title: "Visi & Misi", icon: Layout },
  { slug: "kontak", title: "Informasi Kontak", icon: LinkIcon },
];

const TEXT_COLORS = ["#111827", "#dc2626", "#d97706", "#16a34a", "#2563eb", "#7c3aed", "#db2777"];
const HIGHLIGHT_COLORS = ["#fef08a", "#fdba74", "#fca5a5", "#93c5fd", "#86efac", "#c4b5fd", "#f9a8d4"];

const ALIGNMENT_OPTIONS: Array<{ key: AlignmentMode; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: "left", label: "Rata kiri", icon: AlignLeft },
  { key: "center", label: "Rata tengah", icon: AlignCenter },
  { key: "right", label: "Rata kanan", icon: AlignRight },
  { key: "justify", label: "Justify", icon: AlignJustify },
];

export default function StaticPageEditor({ pages }: { pages: StaticPageItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string>(DEFAULT_PAGES[0].slug);
  const [isPending, startTransition] = useTransition();
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [activeAlignment, setActiveAlignment] = useState<AlignmentMode>("left");
  const [isAlignMenuOpen, setIsAlignMenuOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const draftMap = useMemo<Record<string, StaticPageDraft>>(() => {
    return DEFAULT_PAGES.reduce((acc, page) => {
      const existing = pages.find((item) => item.slug === page.slug);
      acc[page.slug] = {
        title: existing?.title || page.title,
        excerpt: existing?.excerpt || "",
        content: existing?.content_markdown || "",
      };
      return acc;
    }, {} as Record<string, StaticPageDraft>);
  }, [pages]);

  const [drafts, setDrafts] = useState<Record<string, StaticPageDraft>>(draftMap);
  const activePage = drafts[activeSlug];
  const defaultMeta = DEFAULT_PAGES.find((item) => item.slug === activeSlug);
  const activeAlignmentIcon = ALIGNMENT_OPTIONS.find((item) => item.key === activeAlignment)?.icon || AlignLeft;
  const ActiveAlignmentIcon = activeAlignmentIcon;

  useEffect(() => {
    setDrafts(draftMap);
  }, [draftMap]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = activePage?.content || "";
    // Intentionally reset only when switching tab, not on every content state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alignMenuRef.current && !alignMenuRef.current.contains(event.target as Node)) {
        setIsAlignMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setDraftField = (field: keyof StaticPageDraft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [activeSlug]: {
        ...prev[activeSlug],
        [field]: value,
      },
    }));
  };

  const syncEditorContent = () => {
    if (!editorRef.current) return;
    setDraftField("content", editorRef.current.innerHTML);
  };

  const focusEditor = () => editorRef.current?.focus();

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const applyFontSize = (nextSize: number) => {
    const clampedSize = Math.max(12, Math.min(72, nextSize));
    setFontSize(clampedSize);
    runCommand("fontSize", mapPxToLegacySize(clampedSize));
  };

  const applyAlignment = (mode: AlignmentMode) => {
    setActiveAlignment(mode);
    setIsAlignMenuOpen(false);
    if (mode === "left") runCommand("justifyLeft");
    if (mode === "center") runCommand("justifyCenter");
    if (mode === "right") runCommand("justifyRight");
    if (mode === "justify") runCommand("justifyFull");
  };

  const applyOrderedList = (styleType: "decimal" | "lower-alpha") => {
    runCommand("insertOrderedList");
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const parent = node instanceof HTMLElement ? node : node?.parentElement;
    const list = parent?.closest("ol");
    if (list) {
      list.style.listStyleType = styleType;
      syncEditorContent();
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const response = await fetch(`/api/static-pages/${activeSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: activePage?.title || defaultMeta?.title || "",
          excerpt: activePage?.excerpt || "",
          content_markdown: activePage?.content || "",
        }),
      });

      const result = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

      if (!response.ok) {
        addToast(result?.message || result?.error || "Terjadi kesalahan jaringan", "error");
        return;
      }

      addToast(`Halaman "${defaultMeta?.title}" berhasil disimpan!`, "success");
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
        <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Halaman</p>
        </div>
        <div className="p-3 space-y-1">
          {DEFAULT_PAGES.map((item) => {
            const isActive = activeSlug === item.slug;
            return (
              <button
                suppressHydrationWarning
                key={item.slug}
                onClick={() => setActiveSlug(item.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                {item.title}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex-1 w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">Kanvas Halaman</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
            <LinkIcon className="w-3 h-3 text-gray-400" /> /{activeSlug}
          </div>
        </div>

        <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="p-6 md:p-8 space-y-6 flex-1">
            <div>
              <input
                suppressHydrationWarning
                type="text"
                value={activePage?.title || ""}
                onChange={(e) => setDraftField("title", e.target.value)}
                placeholder="Judul Halaman..."
                required
                disabled={isPending}
                className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 outline-none disabled:opacity-50 transition-all focus:ring-0 border-none px-0 bg-transparent"
              />
            </div>

            <div>
              <textarea
                suppressHydrationWarning
                value={activePage?.excerpt || ""}
                onChange={(e) => setDraftField("excerpt", e.target.value)}
                rows={2}
                placeholder="Tulis ringkasan singkat untuk SEO atau meta description (opsional)..."
                disabled={isPending}
                className="w-full text-sm font-medium text-gray-600 placeholder:text-gray-400 outline-none resize-none disabled:opacity-50 transition-all border-l-2 border-emerald-300 bg-emerald-50/30 pl-4 py-2.5 rounded-r-lg focus:ring-0"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                <ToolbarButton onClick={() => applyFontSize(fontSize - 2)} icon={Minus} label="Kecilkan" />
                <div className="flex items-end gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                  <input
                    suppressHydrationWarning
                    type="number"
                    min={12}
                    max={72}
                    step={1}
                    value={fontSize}
                    onChange={(event) => applyFontSize(Number(event.target.value) || 16)}
                    className="w-14 bg-transparent text-center text-sm font-semibold text-gray-800 outline-none"
                  />
                  <span className="text-sm font-semibold text-gray-600">px</span>
                  <span
                    className="block rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.max(20, fontSize * 1.2)}px`, height: `${Math.max(2, Math.round(fontSize / 8))}px` }}
                  />
                </div>
                <ToolbarButton onClick={() => applyFontSize(fontSize + 2)} icon={Plus} label="Besarkan" />
                <ToolbarButton onClick={() => runCommand("bold")} icon={Bold} label="Bold" forceBold />
                <ToolbarButton onClick={() => runCommand("italic")} icon={Italic} label="Italic" />
                <ToolbarButton onClick={() => runCommand("underline")} icon={Underline} label="Underline" />
                <ColorPaletteButton
                  label="Warna teks"
                  icon={<span className="text-sm font-black leading-none">A</span>}
                  colors={TEXT_COLORS}
                  activeColor={textColor}
                  onSelect={(value) => {
                    setTextColor(value);
                    runCommand("foreColor", value);
                  }}
                />
                <ColorPaletteButton
                  label="Highlight"
                  icon={<Highlighter className="w-4 h-4" />}
                  colors={HIGHLIGHT_COLORS}
                  activeColor={highlightColor}
                  onSelect={(value) => {
                    setHighlightColor(value);
                    runCommand("hiliteColor", value);
                  }}
                />
                <span className="mx-1 text-gray-300">|</span>
                <div className="relative" ref={alignMenuRef}>
                  <button
                    suppressHydrationWarning
                    type="button"
                    title="Pemerataan teks"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setIsAlignMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <ActiveAlignmentIcon className="w-4 h-4" />
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {isAlignMenuOpen && (
                    <div className="absolute right-0 top-11 z-20 min-w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                      {ALIGNMENT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applyAlignment(option.key)}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeAlignment === option.key ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            <Icon className="w-4 h-4" /> {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <ToolbarButton onClick={() => runCommand("insertUnorderedList")} icon={List} label="Bullet list" />
                <ToolbarButton onClick={() => applyOrderedList("decimal")} icon={ListOrdered} label="Number list" extraLabel="1." />
                <ToolbarButton onClick={() => applyOrderedList("lower-alpha")} icon={Pilcrow} label="Letter list" extraLabel="a." />
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white min-h-[28rem] overflow-hidden">
                {!activePage?.content && (
                  <div className="pointer-events-none absolute left-5 top-5 text-sm text-gray-300">
                    Tulis isi halaman {defaultMeta?.title} di sini, lalu format seperti dokumen kerja.
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable={!isPending}
                  onInput={syncEditorContent}
                  className="min-h-[28rem] p-5 outline-none text-[15px] leading-7 text-gray-800 [&_u]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:pl-6 [&_a]:text-emerald-700 [&_a]:underline"
                  suppressContentEditableWarning
                />
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-medium">
              Konten disimpan sebagai HTML ringan agar format teks tetap konsisten untuk jamaah.
            </p>
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold py-2.5 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {isPending ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Halaman</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToolbarButton({
  onClick,
  icon: Icon,
  label,
  extraLabel,
  forceBold = false,
}: {
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
  extraLabel?: string;
  forceBold?: boolean;
}) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-gray-700 hover:bg-gray-100"
    >
      <Icon className={`w-4 h-4 ${forceBold ? "stroke-[2.8]" : ""}`} />
      {extraLabel && <span className={`text-xs ${forceBold ? "font-extrabold" : "font-semibold"}`}>{extraLabel}</span>}
    </button>
  );
}

function ColorPaletteButton({
  label,
  icon,
  colors,
  activeColor,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  colors: string[];
  activeColor: string;
  onSelect: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        suppressHydrationWarning
        type="button"
        title={label}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-gray-700 hover:bg-gray-100"
      >
        <span className="flex items-center justify-center">{icon}</span>
        <span className="mt-1 block h-1 w-6 rounded-full" style={{ backgroundColor: activeColor }} />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-20 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(color);
                  setOpen(false);
                }}
                className={`h-7 w-7 rounded-md border-2 ${activeColor === color ? "border-gray-900" : "border-transparent hover:border-gray-300"}`}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function mapPxToLegacySize(px: number) {
  if (px <= 12) return "2";
  if (px <= 14) return "3";
  if (px <= 16) return "4";
  if (px <= 20) return "5";
  if (px <= 28) return "6";
  return "7";
}
