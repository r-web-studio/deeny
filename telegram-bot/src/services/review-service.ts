import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Review } from "../types";

const DATA_DIR = path.join(__dirname, "../../data");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, "[]", "utf-8");
  }
}

function loadReviews(): Review[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveReviews(reviews: Review[]): void {
  ensureDataDir();
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
}

export function getAllReviews(): Review[] {
  return loadReviews();
}

export function getReviewById(id: string): Review | undefined {
  return loadReviews().find((r) => r.id === id);
}

export function addReview(data: Omit<Review, "id" | "date">): Review {
  const reviews = loadReviews();
  const review: Review = {
    id: uuidv4(),
    ...data,
    date: new Date().toISOString(),
  };
  reviews.unshift(review);
  saveReviews(reviews);
  return review;
}

export function deleteReview(id: string): boolean {
  const reviews = loadReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return false;
  reviews.splice(index, 1);
  saveReviews(reviews);
  return true;
}

export function getReviewStats(): {
  total: number;
  average: number;
  breakdown: Record<number, number>;
} {
  const reviews = loadReviews();
  const total = reviews.length;
  const average =
    total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });
  return { total, average, breakdown };
}
