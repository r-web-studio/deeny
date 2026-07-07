import dotenv from "dotenv";
import http from "http";
import TelegramBot from "node-telegram-bot-api";
import { UserSession, BotState } from "./types";
import { registerStartCommand } from "./commands/start";
import { registerReviewCommand } from "./commands/review";
import { registerReviewsCommand } from "./commands/reviews";
import { registerStatsCommand } from "./commands/stats";
import { registerAdminCommand } from "./commands/admin";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is required in .env");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("❌ ADMIN_PASSWORD is required in .env");
  process.exit(1);
}

if (!ADMIN_CHAT_ID) {
  console.error("❌ ADMIN_CHAT_ID is required in .env");
  process.exit(1);
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running");
});

const PORT = process.env.PORT;
if (PORT) {
  server.listen(parseInt(PORT), () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
  });
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const sessions = new Map<number, UserSession>();

console.log("🤖 Sakinah Reviews Bot is starting...");
console.log(`📋 Admin Chat ID: ${ADMIN_CHAT_ID}`);

registerStartCommand(bot, sessions);
registerReviewCommand(bot, sessions, parseInt(ADMIN_CHAT_ID));
registerReviewsCommand(bot, sessions);
registerStatsCommand(bot, sessions);
registerAdminCommand(bot, sessions, ADMIN_PASSWORD, parseInt(ADMIN_CHAT_ID));

bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  sessions.set(chatId, { state: BotState.IDLE, tempData: {} });
  bot.sendMessage(chatId, "Action cancelled.");
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("✅ Bot is running! Press Ctrl+C to stop.");
