"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Bookmark, Search, BookMarked, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

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

const RECITERS = [
  { id: "xalil_xusoriy_hafs", name: "Mahmud Khalil Husari" },
  { id: "abdul_basit_murattal", name: "Abdul Basit (Murattal)" },
  { id: "abdul_basit_mujawwad", name: "Abdul Basit (Mujawwad)" },
  { id: "mishary_rashid", name: "Mishary Rashid Alafasy" },
  { id: "saad_al_ghamdi", name: "Saad Al-Ghamdi" },
  { id: "abdurrahmaan_as_sudais", name: "Abdurrahmaan As-Sudais" },
  { id: "muhammad_jibril", name: "Muhammad Jibril" },
  { id: "yasser_aldosari", name: "Yasser Al-Dosari" },
];

function getSurahAudioUrl(surahNumber: number, reciterId: string): string {
  const padded = String(surahNumber).padStart(3, "0");
  return `https://islom.uz/mp3/surah/${reciterId}/${padded}.mp3`;
}

export default function QuranPage() {
  const { t } = useI18n();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [bookmarks, setBookmarks] = useState<{ surah: number; ayah: number }[]>([]);
  const [search, setSearch] = useState("");
  const [dailyVerse, setDailyVerse] = useState<Ayah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedReciter = localStorage.getItem("deenflow-quran-reciter");
    if (savedReciter && RECITERS.find((r) => r.id === savedReciter)) {
      setSelectedReciter(savedReciter);
    }

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
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
      audioRef.current = null;
    });
  };

  const handleReciterChange = (reciterId: string) => {
    setSelectedReciter(reciterId);
    localStorage.setItem("deenflow-quran-reciter", reciterId);
    setShowReciterMenu(false);
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

  const selectedReciterName = RECITERS.find((r) => r.id === selectedReciter)?.name || "";

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

                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReciterMenu(!showReciterMenu)}
                        className="gap-2"
                      >
                        <span className="truncate max-w-[150px]">{selectedReciterName}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      {showReciterMenu && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg py-1 w-64 max-h-60 overflow-y-auto">
                          {RECITERS.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => handleReciterChange(r.id)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                                selectedReciter === r.id ? "bg-islamic-green/10 text-islamic-green" : ""
                              }`}
                            >
                              {r.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Audio source: islom.uz | Reciter: {selectedReciterName}
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
