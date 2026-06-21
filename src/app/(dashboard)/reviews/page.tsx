"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useI18n } from "@/lib/i18n";

const REVIEWS_KEY = "deenflow-reviews";

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
