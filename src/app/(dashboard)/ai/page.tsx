"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, Trash2, MessageSquare, Loader2, Edit2, Check, Sparkles, Menu, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/lib/i18n";

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
        setConversations(parsed);
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

  const postChat = async (allMessages: Message[]): Promise<string> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
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

  return (
    <div className="flex h-[calc(100dvh-8rem)] gap-4">
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
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
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
