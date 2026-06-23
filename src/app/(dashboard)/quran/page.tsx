"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Bookmark, Search, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  translation: { text: string };
}

interface Reciter {
  id: number;
  name: string;
  link: string;
}

const DEFAULT_RECITERS: Reciter[] = [
  { id: 1, name: "Махмуд Халил Хусари", link: "xalil_xusoriy" },
  { id: 2, name: "Абдулбосит Абдулсамад", link: "abdulbosit_abdulsamad" },
  { id: 3, name: "Абdurраҳим Башари", link: "abu_bakr_shatri" },
  { id: 4, name: "Мишари Рашид Алафаси", link: "mishariy_alafasiy" },
  { id: 5, name: "Саад Ал-Гамди", link: "saad_alghamdi" },
  { id: 6, name: "Ахмад Ал-Аджми", link: "ahmad_alajmi" },
];

function getSurahAudioUrl(surahNumber: number, reciterLink: string): string {
  const padded = String(surahNumber).padStart(3, "0");
  return `https://new.islom.uz/mp3/surah/${reciterLink}_hafs/${padded}.mp3`;
}

export default function QuranPage() {
  const { t } = useI18n();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [bookmarks, setBookmarks] = useState<{ surah: number; ayah: number }[]>([]);
  const [search, setSearch] = useState("");
  const [dailyVerse, setDailyVerse] = useState<Ayah | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>(DEFAULT_RECITERS);
  const [selectedReciter, setSelectedReciter] = useState(DEFAULT_RECITERS[0].link);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedReciter = localStorage.getItem("deenflow-quran-reciter");
    if (savedReciter) {
      setSelectedReciter(savedReciter);
    }

    fetch("https://quran.uz/api/v1/quran/qorilar/1")
      .then((r) => r.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setReciters(data.data);
        }
      })
      .catch(() => {});

    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((data) => setSurahs(data.data || []))
      .catch(() => {});

    const randomSurah = Math.floor(Math.random() * 114) + 1;
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${randomSurah}`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${randomSurah}/en.asad`).then((r) => r.json()),
    ])
      .then(([arData, enData]) => {
        const arAyahs = arData.data?.ayahs || [];
        const enAyahs = enData.data?.ayahs || [];
        if (arAyahs.length) {
          const idx = Math.floor(Math.random() * arAyahs.length);
          setDailyVerse({
            ...arAyahs[idx],
            translation: { text: enAyahs[idx]?.text || "" },
          });
        }
      })
      .catch(() => {});
  }, []);

  const loadSurah = async (num: number) => {
    stopAudio();
    setSelectedSurah(num);
    try {
      const [arRes, enRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}`),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/en.asad`),
      ]);
      const arData = await arRes.json();
      const enData = await enRes.json();
      const arAyahs = arData.data?.ayahs || [];
      const enAyahs = enData.data?.ayahs || [];
      const merged = arAyahs.map((a: Record<string, unknown>, i: number) => ({
        number: a.number,
        text: a.text as string,
        numberInSurah: a.numberInSurah,
        translation: { text: enAyahs[i]?.text || "" },
      }));
      setAyahs(merged);
    } catch {}
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const playSurah = (surahNumber: number) => {
    if (isPlaying && selectedSurah === surahNumber) {
      stopAudio();
      return;
    }

    stopAudio();

    const url = getSurahAudioUrl(surahNumber, selectedReciter);
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = (e) => {
      console.error("Audio error:", url, e);
      toast.error("Failed to load audio. Please try again.");
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error("Audio play failed:", url, err);
      toast.error("Unable to play audio. Check your connection and try again.");
      setIsPlaying(false);
      audioRef.current = null;
    });
  };

  const handleReciterChange = (reciterId: string) => {
    setSelectedReciter(reciterId);
    localStorage.setItem("deenflow-quran-reciter", reciterId);
    if (isPlaying && selectedSurah) {
      stopAudio();
    }
  };

  const toggleBookmark = (surah: number, ayah: number) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.surah === surah && b.ayah === ayah);
      if (exists) return prev.filter((b) => !(b.surah === surah && b.ayah === ayah));
      return [...prev, { surah, ayah }];
    });
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  const selectedReciterName = reciters.find((r) => r.link === selectedReciter)?.name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold">{t("quran.title")}</h1>

      {dailyVerse && (
        <Card className="glass border-gold/20">
          <CardHeader>
            <CardTitle className="text-sm text-gold">{t("quran.verseOfTheDay")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl leading-relaxed text-right mb-2">{dailyVerse.text}</p>
            <p className="text-sm text-muted-foreground">{dailyVerse.translation?.text || ""}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass">
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("quran.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px]">
                <div className="space-y-1">
                  {filteredSurahs.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => loadSurah(s.number)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        selectedSurah === s.number
                          ? "bg-islamic-green/10 text-islamic-green"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium">{s.number}.</span> {s.englishName}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="glass">
            <CardContent className="p-6">
              {selectedSurah ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedReciter}
                        onValueChange={(v) => handleReciterChange(v ?? DEFAULT_RECITERS[0].link)}
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder={selectedReciterName} />
                        </SelectTrigger>
                        <SelectContent>
                          {reciters.map((reciter) => (
                            <SelectItem key={reciter.link} value={reciter.link}>
                              {reciter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => playSurah(selectedSurah)}
                        className="bg-islamic-green hover:bg-islamic-green/90"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Play Surah"}
                      </Button>
                      {isPlaying && (
                        <Badge variant="secondary" className="animate-pulse">
                          Playing
                        </Badge>
                      )}
                    </div>

                    <Badge variant="outline" className="text-xs">
                      quran.uz (islom.uz)
                    </Badge>
                  </div>

                  {ayahs.map((ayah) => {
                    const isBookmarked = bookmarks.some(
                      (b) => b.surah === selectedSurah && b.ayah === ayah.numberInSurah
                    );
                    return (
                      <div
                        key={ayah.number}
                        className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-lg md:text-2xl leading-relaxed text-right mb-3 break-words">
                              {ayah.text}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {ayah.translation?.text || ""}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="text-xs w-8 justify-center"
                            >
                              {ayah.numberInSurah}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                toggleBookmark(selectedSurah, ayah.numberInSurah)
                              }
                            >
                              <Bookmark
                                className={`h-3 w-3 ${
                                  isBookmarked ? "fill-gold text-gold" : ""
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("quran.selectSurah")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {bookmarks.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-gold" /> {t("quran.bookmarks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((b, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-islamic-green/10"
                  onClick={() => loadSurah(b.surah)}
                >
                  Surah {b.surah}: Ayah {b.ayah}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
