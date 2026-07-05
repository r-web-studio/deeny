export interface Review {
  id: string;
  name: string;
  telegramId: number;
  telegramUsername?: string;
  rating: number;
  comment: string;
  date: string;
}

export enum BotState {
  IDLE = "idle",
  AWAITING_REVIEW_NAME = "awaiting_review_name",
  AWAITING_REVIEW_RATING = "awaiting_review_rating",
  AWAITING_REVIEW_COMMENT = "awaiting_review_comment",
  AWAITING_REVIEW_CONFIRM = "awaiting_review_confirm",
  AWAITING_ADMIN_PASSWORD = "awaiting_admin_password",
}

export interface UserSession {
  state: BotState;
  tempData: Record<string, unknown>;
  isAdmin?: boolean;
}
