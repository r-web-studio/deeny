import TelegramBot from "node-telegram-bot-api";

export const mainMenuKeyboard = {
  inline_keyboard: [
    [
      { text: "✍️ Write Review", callback_data: "start_review" },
      { text: "📖 View Reviews", callback_data: "view_reviews" },
    ],
    [
      { text: "📊 Statistics", callback_data: "view_stats" },
    ],
  ],
};

export const backButton = {
  text: "🏠 Main Menu",
  callback_data: "back_to_menu",
};

export const reviewAgainButton = {
  text: "✍️ Write Another Review",
  callback_data: "start_review",
};

export const viewReviewsButton = {
  text: "📖 View Reviews",
  callback_data: "view_reviews",
};

export const statsButton = {
  text: "📊 Statistics",
  callback_data: "view_stats",
};

export function reviewSubmittedKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [reviewAgainButton, viewReviewsButton],
      [statsButton, backButton],
    ],
  };
}

export function reviewsPageKeyboard(
  page: number,
  totalPages: number
): TelegramBot.InlineKeyboardMarkup {
  const buttons: TelegramBot.InlineKeyboardButton[][] = [];

  const navRow: TelegramBot.InlineKeyboardButton[] = [];
  if (page > 0) {
    navRow.push({ text: "⬅️ Prev", callback_data: `reviews_page_${page - 1}` });
  }
  navRow.push({ text: `${page + 1}/${totalPages}`, callback_data: "noop" });
  if (page < totalPages - 1) {
    navRow.push({ text: "Next ➡️", callback_data: `reviews_page_${page + 1}` });
  }
  if (navRow.length > 1) {
    buttons.push(navRow);
  }

  buttons.push([
    { text: "✍️ Write Review", callback_data: "start_review" },
    { text: "🏠 Main Menu", callback_data: "back_to_menu" },
  ]);

  return { inline_keyboard: buttons };
}

export function emptyReviewsKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "✍️ Be the First!", callback_data: "start_review" },
        { text: "🏠 Main Menu", callback_data: "back_to_menu" },
      ],
    ],
  };
}

export function statsKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "✍️ Write Review", callback_data: "start_review" },
        { text: "📖 View Reviews", callback_data: "view_reviews" },
      ],
      [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
    ],
  };
}

export function adminPanelKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "📋 All Reviews", callback_data: "admin_all_reviews" },
        { text: "📊 Stats", callback_data: "admin_stats" },
      ],
      [
        { text: "💬 Reply to User", callback_data: "admin_reply_review" },
        { text: "🗑️ Delete Review", callback_data: "admin_delete_review" },
      ],
      [
        { text: "🏠 Main Menu", callback_data: "back_to_menu" },
        { text: "🚪 Logout", callback_data: "admin_logout" },
      ],
    ],
  };
}

export function adminDeleteKeyboard(
  reviews: { id: string; name: string; rating: number }[]
): TelegramBot.InlineKeyboardMarkup {
  const buttons: TelegramBot.InlineKeyboardButton[][] = [];

  reviews.slice(0, 8).forEach((r) => {
    buttons.push([
      { text: `🗑️ ${r.name} (${r.rating}★)`, callback_data: `delete_review_${r.id}` },
    ]);
  });

  buttons.push([
    { text: "🔙 Back to Admin", callback_data: "admin_panel" },
    { text: "🏠 Main Menu", callback_data: "back_to_menu" },
  ]);

  return { inline_keyboard: buttons };
}

export function adminAllReviewsKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🗑️ Delete Review", callback_data: "admin_delete_review" },
        { text: "📊 Stats", callback_data: "admin_stats" },
      ],
      [
        { text: "🔙 Back to Admin", callback_data: "admin_panel" },
        { text: "🏠 Main Menu", callback_data: "back_to_menu" },
      ],
    ],
  };
}

export function adminReplyKeyboard(
  reviews: { id: string; name: string; rating: number; telegramId: number }[]
): TelegramBot.InlineKeyboardMarkup {
  const buttons: TelegramBot.InlineKeyboardButton[][] = [];

  reviews.slice(0, 8).forEach((r) => {
    buttons.push([
      { text: `💬 Reply to ${r.name} (${r.rating}★)`, callback_data: `reply_review_${r.id}` },
    ]);
  });

  buttons.push([
    { text: "🔙 Back to Admin", callback_data: "admin_panel" },
    { text: "🏠 Main Menu", callback_data: "back_to_menu" },
  ]);

  return { inline_keyboard: buttons };
}

export function adminStatsKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "📋 All Reviews", callback_data: "admin_all_reviews" },
        { text: "🗑️ Delete Review", callback_data: "admin_delete_review" },
      ],
      [
        { text: "🔙 Back to Admin", callback_data: "admin_panel" },
        { text: "🏠 Main Menu", callback_data: "back_to_menu" },
      ],
    ],
  };
}
