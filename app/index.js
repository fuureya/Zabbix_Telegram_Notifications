import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import telegramController from "./src/telegramController.js";
const {
  sendTriggerEveryHour,
  getHosts,
  getTokenZabbix,
  getHostsInactive,
  getLinkDown,
} = telegramController;

dotenv.config();

const bot = new Telegraf(process.env.ZABBIX_TELEGRAM_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Bot Aktif!! bot ini akan mengirim informasi tentang jaringan selama 1 jam sekali!! \n \n List Perintah \n \n 
    Untuk Memulai Bot : /start \n
    Lihat Data Host Yang Aktif : /gethostactive \n
    Lihat Data Host Yang Tidak Aktif : /gethostinactive \n
    Lihat Link Yang Tidak Aktif : /getlinkdown \n
    Ambil Token Zabbix : /gettoken \n`
  );
  sendTriggerEveryHour(ctx);
});

bot.command("gethostactive", (ctx) => {
  ctx.reply("Mengambil Informasi Jumlah Host Dari Zabbix...");
  getHosts(ctx);
});

bot.command("gethostinactive", (ctx) => {
  ctx.reply("Mengambil Informasi Jumlah Host Dari Zabbix...");
  getHostsInactive(ctx);
});

bot.command("gettoken", (ctx) => {
  ctx.reply("Mengambil token Dari Zabbix...");
  getTokenZabbix(ctx);
});

bot.command("getlinkdown", (ctx) => {
  ctx.reply("Mengambil Data Dari Zabbix...");
  getLinkDown(ctx);
});

bot.command("stop", (ctx) => {
  ctx.reply("🛑 Bot dihentikan.");
  bot.stop();
});

bot
  .launch()
  .then(() => console.log("🤖 Bot aktif"))
  .catch((err) => console.error("❌ Bot gagal jalan:", err));
