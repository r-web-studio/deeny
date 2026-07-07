# Sakinah Telegram Reviews Bot

A Telegram bot for collecting and managing user reviews for the Sakinah app.

## Setup

1. Install dependencies:
   ```bash
   cd telegram-bot
   npm install
   ```

2. Configure `.env` file:
   ```
   BOT_TOKEN=your_bot_token
   ADMIN_PASSWORD=your_secure_password
   ADMIN_CHAT_ID=your_telegram_user_id
   ```

   To get your Telegram User ID, message `@userinfobot` on Telegram.

3. Run the bot:
   ```bash
   npm run dev    # Development with auto-reload
   npm run start  # Production
   ```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message with main menu |
| `/review` | Submit a new review |
| `/reviews` | View all reviews (paginated) |
| `/stats` | View review statistics |
| `/admin` | Access admin panel (password protected) |
| `/logout` | End admin session |
| `/cancel` | Cancel current action |

## Features

- **Review Wizard**: Step-by-step review submission with star ratings
- **Pagination**: Browse reviews 5 at a time
- **Admin Panel**: View, delete, and export reviews
- **Admin Notifications**: Get notified when new reviews arrive
- **Islamic Theme**: Assalamu Alaikum greetings and modest design

## Storage

Reviews are stored in `data/reviews.json`. This file is auto-created on first run.
