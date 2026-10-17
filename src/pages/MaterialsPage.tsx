import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { MaterialItem } from "../types";
import {
  FolderDown,
  Download,
  ExternalLink,
  FileText,
  Music,
  Video,
  Sliders,
  Sparkles,
  Search,
  ArrowLeft,
} from "lucide-react";

interface MaterialsPageProps {
  onBack?: () => void;
}

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "materials"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as MaterialItem[];
        setMaterials(items);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "materials");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const categories = ["All", "Footage", "Audio", "Presets", "Cheatsheet", "Software"];

  const filtered = materials.filter((item) => {
    const matchesCat = filterCategory === "All" || item.category === filterCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Footage":
        return <Video className="w-4 h-4 text-orange-500" />;
      case "Audio":
        return <Music className="w-4 h-4 text-purple-500" />;
      case "Presets":
        return <Sliders className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-[var(--text-main)]">
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent-orange)]" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 border-b border-[var(--border-subtle)] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] text-xs font-bold">
          <FolderDown className="w-3.5 h-3.5" />
          <span>Course Assets & Toolkits</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--text-main)]">
          Lesson Materials & Downloads
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Download real commercial raw footage, audio stems, keyboard shortcut cheat sheets, and editing project templates used during class.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? "bg-[var(--accent-orange)] text-white"
                  : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-light)]" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-orange)]"
          />
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">
          Loading materials...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center space-y-3">
          <FolderDown className="w-10 h-10 text-[var(--text-light)] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[var(--text-main)]">
            {materials.length === 0 ? "Materials will be unlocked with Session 1" : "No materials match your filter"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            {materials.length === 0
              ? "All practice files, camera footage b-roll packages, and shortcut sheets are curated before each live weekend session."
              : "Try switching back to 'All' categories or clearing your search keywords."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                    {getCategoryIcon(mat.category)}
                    <span>{mat.category}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    {mat.fileType}
                  </span>
                </div>

                <h4 className="font-serif text-base font-bold text-[var(--text-main)]">
                  {mat.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                {mat.lessonNumber ? (
                  <span className="text-[11px] text-[var(--text-light)]">
                    Lesson 0{mat.lessonNumber}
                  </span>
                ) : (
                  <span className="text-[11px] text-[var(--text-light)]">Course Toolkit</span>
                )}

                <a
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-orange-soft)] text-[var(--accent-orange)] hover:bg-[var(--accent-orange)] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Open</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
