"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, Trash2, MessageSquare, Loader2, Edit2, Check, Sparkles, Menu, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SafeMarkdown } from "@/components/safe-markdown";
import { useI18n } from "@/lib/i18n";
import { saveAIConversations as syncAIConversations } from "@/lib/sync/data-sync";
import { createClient } from "@/lib/supabase/client";

const AI_STORAGE_KEY = "deenflow-ai-conversations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

export default function AiPage() {
  const { t } = useI18n();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    const saved = localStorage.getItem(AI_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setConversations(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const activeConvo = conversations.find((c) => c.id === activeId);
  const messages = activeConvo?.messages || [];

  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(updated));
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) syncAIConversations(user.id, updated).catch(() => {});
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConvo = useCallback(() => {
    const id = crypto.randomUUID();
    const convo: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      created_at: new Date().toISOString(),
    };
    saveConversations([convo, ...conversationsRef.current]);
    setActiveId(id);
    return id;
  }, []);

  const deleteConvo = (id: string) => {
    saveConversations(conversationsRef.current.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameTitle(currentTitle);
  };

  const saveRename = (id: string) => {
    saveConversations(conversationsRef.current.map((c) => (c.id === id ? { ...c, title: renameTitle } : c)));
    setRenamingId(null);
  };

  const lastSentRef = useRef<number>(0);

  const postChat = async (allMessages: Message[], systemPrompt?: string): Promise<string> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, systemPrompt }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ content: null }));
        if (res.status === 404) {
          return "AI service is not available. The API endpoint could not be found. Please check the server configuration or try again later.";
        }
        if (res.status === 429) {
          return "AI service is busy right now. Please wait a few seconds and try again.";
        }
        if (res.status === 500) {
          return errData.content || "AI service is not configured. Please set the OPENROUTER_API_KEY environment variable.";
        }
        return errData.content || `Server error (${res.status}). Please try again.`;
      }
      const data = await res.json();
      return data.content || "No response generated.";
    } catch (err) {
      return "Unable to connect to AI service. Please check your internet connection and try again.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeId || loading) return;

    const now = Date.now();
    if (now - lastSentRef.current < 3000) {
      return;
    }
    lastSentRef.current = now;
    const userMsg: Message = { role: "user", content: input };
    const currentInput = input;
    setInput("");
    setLoading(true);

    const convoBefore = conversationsRef.current.find((c) => c.id === activeId);
    const history = convoBefore?.messages || [];
    const allMessages = [...history, userMsg];

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, userMsg],
              title: c.messages.length === 0 ? currentInput.slice(0, 40) : c.title,
            }
          : c
      )
    );

    const content = await postChat(allMessages);
    const assistantMsg: Message = { role: "assistant", content };

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    );
    setLoading(false);
  };

  const dailyCheckin = async (prompt: string) => {
    let targetId = activeId;
    if (!targetId) {
      targetId = createConvo();
    }
    setInput("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: prompt };

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === targetId
          ? { ...c, messages: [...c.messages, userMsg], title: "Daily Check-in" }
          : c
      )
    );

    const content = await postChat([userMsg]);
    const assistantMsg: Message = { role: "assistant", content };

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === targetId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    );
    setLoading(false);
  };

  const generateProgressSummary = () => {
    const progressData: string[] = [];

    // Prayer progress
    const prayerRaw = localStorage.getItem("deenflow-prayer-history");
    if (prayerRaw) {
      const history = JSON.parse(prayerRaw) as Record<string, Record<string, string>>;
      const dates = Object.keys(history).sort().reverse();
      const last7 = dates.slice(0, 7);
      let totalCompleted = 0;
      let perfectDays = 0;
      for (const date of last7) {
        const day = history[date];
        const completed = Object.values(day).filter((s) => s === "completed").length;
        totalCompleted += completed;
        if (completed === 5) perfectDays++;
      }
      progressData.push(`PRAYER LOG (Last 7 days): ${totalCompleted}/35 prayers completed. ${perfectDays} perfect days (all 5 prayers). Recent dates: ${last7.join(", ") || "none"}`);
    }

    // Dhikr progress
    const dhikrRaw = localStorage.getItem("deenflow-dhikr-sessions");
    if (dhikrRaw) {
      const sessions = JSON.parse(dhikrRaw) as { count: number; dhikr_type: string; date: string }[];
      const last7 = sessions.filter((s) => {
        const d = new Date(s.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      });
      const totalDhikr = last7.reduce((sum, s) => sum + s.count, 0);
      const types = new Set(last7.map((s) => s.dhikr_type));
      progressData.push(`DHIKR LOG (Last 7 days): ${totalDhikr} total dhikr completed across ${types.size} different types`);
    }

    // Task progress
    const tasksRaw = localStorage.getItem("deenflow-tasks");
    if (tasksRaw) {
      const tasks = JSON.parse(tasksRaw) as { completed: boolean; title: string }[];
      const completed = tasks.filter((t) => t.completed).length;
      progressData.push(`TASKS: ${completed}/${tasks.length} tasks completed`);
    }

    // Journal entries
    const journalRaw = localStorage.getItem("deenflow-journal");
    if (journalRaw) {
      const entries = JSON.parse(journalRaw) as { date: string }[];
      const last7 = entries.filter((e) => {
        const d = new Date(e.date);
        const now = new Date();
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
      });
      progressData.push(`JOURNAL: ${entries.length} total entries, ${last7.length} in the last 7 days`);
    }

    // Clean streak
    const streakRaw = localStorage.getItem("deenflow-streak");
    if (streakRaw) {
      const data = JSON.parse(streakRaw) as { currentStreak: number; longestStreak: number };
      progressData.push(`CLEAN STREAK: Currently ${data.currentStreak} days, longest was ${data.longestStreak} days`);
    }

    // Achievements
    const achieveRaw = localStorage.getItem("deenflow-achievements");
    if (achieveRaw) {
      const earned = JSON.parse(achieveRaw) as { index: number }[];
      progressData.push(`ACHIEVEMENTS: ${earned.length} achievements earned`);
    }

    // Daily checkins
    const checkinsRaw = localStorage.getItem("deenflow-daily-checkins");
    if (checkinsRaw) {
      const checkins = JSON.parse(checkinsRaw) as Record<string, boolean>;
      const dates = Object.keys(checkins).sort().reverse().slice(0, 7);
      progressData.push(`DAILY CHECK-INS: ${Object.keys(checkins).length} total check-ins. Last 7: ${dates.join(", ") || "none"}`);
    }

    return progressData.join("\n");
  };

  const sendProgressSummary = async () => {
    let targetId = activeId;
    if (!targetId) {
      targetId = createConvo();
    }
    setInput("");
    setLoading(true);

    const progressData = generateProgressSummary();
    const summaryPrompt = `Here is my weekly progress data from Sakinah. Please analyze it and give me a comprehensive summary. Celebrate my achievements, note areas where I can improve, and provide specific encouragement and tips for next week. Be warm and motivational. Here is my data:\n\n${progressData}`;

    const userMsg: Message = { role: "user", content: summaryPrompt };

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === targetId
          ? { ...c, messages: [...c.messages, userMsg], title: "Weekly Progress Summary" }
          : c
      )
    );

    const systemPrompt = `You are Sakinah Assistant, an Islamic AI companion. The user has shared their weekly progress data from the Sakinah app. Analyze this data thoughtfully:
1. Celebrate specific achievements and milestones reached
2. Identify patterns (consistent prayers, growing dhikr, etc.)
3. Gently note areas for improvement with specific suggestions
4. Provide Islamic encouragement with relevant Quranic verses or hadith when appropriate
5. End with specific, actionable goals for next week
Be warm, supportive, and use the data to give personalized feedback. Use markdown formatting.`;

    const content = await postChat([userMsg], systemPrompt);
    const assistantMsg: Message = { role: "assistant", content };

    saveConversations(
      conversationsRef.current.map((c) =>
        c.id === targetId ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    );
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-7rem)] gap-4 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-islamic-green text-white hover:bg-islamic-green/90"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden"} md:relative md:z-auto md:flex md:w-64 flex-col border-r border-border/50 bg-background`}>
        <div className="p-3">
          <Button onClick={createConvo} className="w-full bg-islamic-green hover:bg-islamic-green/90">
            <Plus className="h-4 w-4 mr-2" />{t("ai.newChat")}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${activeId === c.id ? "bg-islamic-green/10 text-islamic-green" : "hover:bg-accent text-muted-foreground"}`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                {renamingId === c.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      className="h-6 text-xs"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.key === "Enter" && saveRename(c.id)}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); saveRename(c.id); }}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="flex-1 truncate">{c.title}</span>
                )}
                {renamingId !== c.id && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); startRename(c.id, c.title); }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteConvo(c.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeId ? (
          <>
            <ScrollArea className="flex-1 p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-islamic-green to-islamic-green/70 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{t("ai.title")}</h2>
                  <p className="text-muted-foreground max-w-md">
                    {t("ai.description")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                    <Button
                      variant="outline"
                      className="text-left h-auto py-3 border-islamic-green/30 bg-islamic-green/5"
                      onClick={sendProgressSummary}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-islamic-green" />
                        Get Weekly Progress Summary
                      </span>
                    </Button>
                    {[
                      t("ai.prompts.howWasYourDay"),
                      t("ai.prompts.didYouPray"),
                      t("ai.prompts.whatAreYourGoals"),
                      t("ai.prompts.shareReflection"),
                    ].map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        className="text-left h-auto py-3"
                        onClick={() => dailyCheckin(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-islamic-green text-white"
                          : "glass"
                      }`}
                    >
                      <CardContent className="p-3">
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <SafeMarkdown className="prose prose-sm dark:prose-invert max-w-none">{msg.content}</SafeMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex justify-start">
                  <Card className="glass">
                    <CardContent className="p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-islamic-green" />
                      <span className="text-sm text-muted-foreground">{t("ai.thinking")}</span>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t border-border/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai.typeMessage")}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-islamic-green hover:bg-islamic-green/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-islamic-green to-islamic-green/70 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("ai.aiLabel")}</h1>
            <p className="text-muted-foreground max-w-md">
              {t("ai.welcome")}
            </p>
            <Button
              onClick={createConvo}
              className="bg-islamic-green hover:bg-islamic-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />{t("ai.startChat")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
