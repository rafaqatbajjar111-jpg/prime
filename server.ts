import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "3.0.4-STRONG" });
  });

  app.post("/api/feedback", express.json(), async (req, res) => {
    const { message } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("TELEGRAM_CONFIG_MISSING", { token: !!token, chatId: !!chatId });
      return res.status(500).json({ error: "Telegram configuration missing. Please add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to Secrets." });
    }

    try {
      const controller = new AbortController();
      const timeoutToken = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `⚡️ [LEGENDARY_LIVE_UPDATE]\n\n${message}`,
          parse_mode: "Markdown"
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutToken);
      const data = await response.json();
      if (!data.ok) {
        console.error("TELEGRAM_API_ERROR", data);
      }
      res.json({ success: data.ok, data });
    } catch (err) {
      console.error("NODE_FETCH_ERROR", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Failed to send feedback" });
    }
  });

  // Global error handlers to prevent process death
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
