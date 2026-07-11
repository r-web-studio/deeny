"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Calendar, Tag, PenLine, Smile, Heart, CloudRain, Flame, Wind, Sparkles, Moon, PartyPopper, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MOODS } from "@/lib/constants";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import { saveJournalEntries as syncJournalEntries } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const JOURNAL_STORAGE_KEY = "deenflow-journal";

const moodIcons: Record<string, React.ReactNode> = {
  smile: <Smile className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  "cloud-rain": <CloudRain className="h-5 w-5" />,
  flame: <Flame className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  moon: <Moon className="h-5 w-5" />,
  "party-popper": <PartyPopper className="h-5 w-5" />,
};

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: string;
}

export default function JournalPage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const saveEntry = () => {
    if (!title.trim() || !content.trim()) return;
    const newEntries = [
      { id: crypto.randomUUID(), title, content, mood, tags, date: new Date().toISOString() },
      ...entries,
    ];
    setEntries(newEntries);
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) syncJournalEntries(user.id, newEntries).catch(() => {});
    });
    setTitle("");
    setContent("");
    setMood("");
    setTags([]);
    setShowEditor(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string } | null } }) => {
      if (user) syncJournalEntries(user.id, updated).catch(() => {});
    });
    toast.success("Entry deleted");
  };

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("journal.title")}</h1>
          <p className="text-muted-foreground">{entries.length} {t("journal.entries")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>{t("journal.list")}</Button>
          <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")}><Calendar className="h-4 w-4 mr-1" />{t("journal.calendar")}</Button>
          <Button onClick={() => setShowEditor(!showEditor)} className="bg-islamic-green hover:bg-islamic-green/90">
            <Plus className="h-4 w-4 mr-1" />{t("journal.newEntry")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
              toast.success("Journal saved!");
            }}
          >
            Save Progress
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass">
              <CardHeader><CardTitle>{t("journal.newTitle")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder={t("journal.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder={t("journal.writePlaceholder")} value={content} onChange={(e) => setContent(e.target.value)} rows={6} />
                <div>
                  <p className="text-sm font-medium mb-2">{t("journal.howFeeling")}</p>
                  <div className="flex gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.label}
                        onClick={() => setMood(m.label)}
                        className={`p-2 rounded-lg transition-all ${mood === m.label ? "bg-islamic-green/20 text-islamic-green scale-110" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        title={m.label}
                      >
                        {moodIcons[m.icon]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <Input placeholder={t("journal.addTag")} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="flex-1" />
                    <Button variant="outline" onClick={addTag}><Tag className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))}>
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-islamic-green hover:bg-islamic-green/90" onClick={saveEntry}>{t("journal.saveEntry")}</Button>
                  <Button variant="outline" onClick={() => setShowEditor(false)}>{t("journal.cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("journal.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {viewMode === "calendar" ? (
        <Card className="glass">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="p-2 font-medium text-muted-foreground">{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (34 - i));
                const hasEntry = entries.some((e) => new Date(e.date).toDateString() === d.toDateString());
                return (
                  <div key={i} className={`p-1 sm:p-2 rounded-lg text-[10px] sm:text-sm ${hasEntry ? "bg-islamic-green/20 text-islamic-green font-bold" : "text-muted-foreground hover:bg-accent"}`}>
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12 text-muted-foreground">
                <PenLine className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("journal.empty")}</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((entry) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{entry.title}</h3>
                          {entry.mood && <span className="text-islamic-green">{moodIcons[MOODS.find((m) => m.label === entry.mood)?.icon || "smile"]}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{format(new Date(entry.date), "MMM d, yyyy")}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
