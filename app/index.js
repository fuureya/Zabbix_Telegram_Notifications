import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import telegramController from "./src/telegramController.js";
const { sendTriggerFourHours, getHosts, getTokenZabbix } = telegramController;
dotenv.config();

const bot = new Telegraf(process.env.ZABBIX_TELEGRAM_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "Bot Aktif!! bot ini akan mengirim informasi tentang jaringan selama 4 jam sekali!!"
  );
  sendTriggerFourHours(ctx);
});

bot.command("gethost", (ctx) => {
  ctx.reply("Mengambil Informasi Jumlah Host Dari Zabbix...");
  getHosts(ctx);
});

bot.command("gettoken", (ctx) => {
  ctx.reply("Mengambil token Dari Zabbix...");
  getTokenZabbix(ctx);
});

bot.command("stop", (ctx) => {
  ctx.reply("🛑 Bot dihentikan.");
  bot.stop();
});

bot
  .launch()
  .then(() => console.log("🤖 Bot aktif"))
  .catch((err) => console.error("❌ Bot gagal jalan:", err));
