"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, MessageSquare, User, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useI18n } from "@/lib/i18n";

const REVIEWS_KEY = "deenflow-reviews";
const TELEGRAM_BOT_URL = "https://t.me/YourBotUsername"; // TODO: Replace with actual bot username

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || rating)
                ? "fill-gold text-gold"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      if (raw) setReviews(JSON.parse(raw));
    } catch {}
  }, []);

  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  };

  const submitReview = () => {
    if (!name.trim() || !comment.trim() || rating === 0) {
      toast.error("Please fill in all fields and select a rating");
      return;
    }
    const review: Review = {
      id: crypto.randomUUID(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };
    saveReviews([review, ...reviews]);
    setName("");
    setRating(0);
    setComment("");
    setShowForm(false);
    toast.success("Review submitted! JazakAllahu Khairan!");
  };

  const deleteReview = (id: string) => {
    saveReviews(reviews.filter((r) => r.id !== id));
    toast.success("Review deleted");
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="glass border-islamic-green/30 bg-gradient-to-r from-islamic-green/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-islamic-green">Write your reviews on Telegram</h3>
              <p className="text-sm text-muted-foreground">Thank you for your feedback!</p>
            </div>
            <Button
              asChild
              className="bg-[#2AABEE] hover:bg-[#229ED9] text-white shrink-0"
            >
              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                Open Telegram
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">{t("reviews.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("reviews.subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-islamic-green hover:bg-islamic-green/90">
          <Send className="h-4 w-4 mr-2" />
          {t("reviews.writeReview")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t("reviews.overallRating")}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="text-5xl font-bold text-gradient">{avgRating}</div>
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <p className="text-xs text-muted-foreground">{reviews.length} {t("reviews.reviewCount")}{reviews.length !== 1 ? t("reviews.reviewCountPlural") : ""}</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t("reviews.ratingBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-right text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card className="glass border-islamic-green/20">
                  <CardHeader>
                    <CardTitle className="text-sm">{t("reviews.writeYourReview")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">{t("reviews.yourName")}</label>
                      <Input
                        placeholder={t("reviews.namePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">{t("reviews.yourRating")}</label>
                      <StarRating rating={rating} onRate={setRating} interactive />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">{t("reviews.yourReview")}</label>
                      <Textarea
                        placeholder={t("reviews.reviewPlaceholder")}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={submitReview} className="bg-islamic-green hover:bg-islamic-green/90">
                        <Send className="h-4 w-4 mr-2" /> {t("reviews.submit")}
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)}>{t("reviews.cancel")}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {reviews.length === 0 ? (
            <Card className="glass">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t("reviews.noReviews")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-islamic-green/10 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-islamic-green" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{review.name}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {new Date(review.date).toLocaleDateString()}
                              </Badge>
                            </div>
                            <StarRating rating={review.rating} />
                            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
