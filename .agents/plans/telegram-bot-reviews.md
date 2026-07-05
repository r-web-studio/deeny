# Telegram Reviews Bot - Implementation Plan

## Overview
A standalone Telegram bot in `telegram-bot/` for the DeenFlow app where users can write reviews, view other reviews, and admins get notified of new submissions.

## Architecture

### Tech Stack
- **Runtime**: Node.js + TypeScript
- **Telegram Library**: `node-telegram-bot-api` (mature, well-documented)
- **Storage**: `reviews.json` file (simple, zero-config)
- **Bot Theme**: Islamic-themed (bilingual EN/AR greetings, modest green color scheme)

### Project Structure
```
telegram-bot/
├── package.json
├── tsconfig.json
├── .env                  # BOT_TOKEN, ADMIN_PASSWORD, ADMIN_CHAT_ID
├── src/
│   ├── index.ts          # Entry point, bot initialization
│   ├── commands/
│   │   ├── start.ts      # Welcome message + main menu
│   │   ├── review.ts     # /review - submit a review (name, rating, comment)
│   │   ├── reviews.ts    # /reviews - view all reviews (paginated)
│   │   ├── stats.ts      # /stats - review statistics
│   │   └── admin.ts      # /admin - admin panel (password protected)
│   ├── services/
│   │   └── review-service.ts  # CRUD operations on reviews.json
│   ├── middleware/
│   │   └── admin-guard.ts     # Admin password verification
│   └── types.ts          # Review interface, shared types
├── data/
│   └── reviews.json      # Persisted reviews (auto-created)
└── README.md             # Setup instructions
```

## Bot Features & Commands

### User Commands
| Command | Description |
|---------|-------------|
| `/start` | Welcome message with Islamic greeting + inline keyboard menu |
| `/review` | Submit review flow: name → rating (1-5 stars) → comment → confirm |
| `/reviews` | View paginated reviews with star ratings + date (5 per page) |
| `/stats` | Review statistics: total count, average rating, rating breakdown |

### Admin Commands
| Command | Description |
|---------|-------------|
| `/admin` | Admin login flow: prompts for password, shows admin panel |
| `/adminpanel` | (after login) Admin panel with review count, delete option, export |
| `/logout` | End admin session |

### Conversation Flow

#### `/review` Flow
1. Bot asks: "What's your name?"
2. User enters name → Bot asks: "Rate DeenFlow (1-5 stars)" with inline buttons
3. User taps star button → Bot asks: "Write your review"
4. User types comment → Bot shows preview + "Confirm" / "Cancel" buttons
5. On confirm → Review saved → **Admin gets notification** with review details

#### `/admin` Flow
1. User sends `/admin`
2. Bot asks: "Enter admin password:"
3. User enters password → On success: Admin panel with buttons
4. Admin panel buttons: "View All Reviews" | "Delete Review" | "Export Data" | "Stats"
5. `/logout` clears admin session

### Admin Notification
When a new review is submitted:
- Bot sends a message to `ADMIN_CHAT_ID` with:
  - User's name
  - Star rating (visual stars)
  - Review comment
  - Date/time
  - Inline "Delete" button (quick action)

## Data Model

### `reviews.json`
```typescript
interface Review {
  id: string;           // UUID
  name: string;         // Reviewer's display name
  telegramId: number;   // Reviewer's Telegram user ID
  telegramUsername?: string; // @username if available
  rating: number;       // 1-5
  comment: string;      // Review text
  date: string;         // ISO timestamp
}
```

## Environment Variables (`.env`)
```
BOT_TOKEN=8642702145:AAEAhyKFmL7pjfXI8HplPq2RulzEITsltDY
ADMIN_PASSWORD=your_secure_password_here
ADMIN_CHAT_ID=your_telegram_user_id
```

## Implementation Steps

1. **Initialize project**: Create `telegram-bot/` folder, `package.json`, `tsconfig.json`
2. **Install dependencies**: `node-telegram-bot-api`, `uuid`, `dotenv`, `typescript`
3. **Create types** (`types.ts`): Review interface, BotState enum
4. **Create review service** (`review-service.ts`): load/save/getAll/add/delete from JSON
5. **Create admin middleware** (`admin-guard.ts`): session-based password verification
6. **Create commands**:
   - `start.ts` - Welcome + inline keyboard
   - `review.ts` - Multi-step review submission wizard
   - `reviews.ts` - Paginated review listing
   - `stats.ts` - Statistics with visual bars
   - `admin.ts` - Admin panel with CRUD
7. **Wire it all together** (`index.ts`): Register commands, handle callbacks
8. **Add scripts** to root `package.json`: `"bot:dev"`, `"bot:start"`
9. **Test the bot** end-to-end

## Conventions
- TypeScript strict mode
- Use existing project patterns where applicable
- Islamic greeting "Assalamu Alaikum" in welcome messages
- Green color theme in text formatting (Telegram HTML/MarkdownV2)
