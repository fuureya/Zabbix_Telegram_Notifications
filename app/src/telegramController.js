import { Markup } from "telegraf";
import telegramController from "./zabbixController.js";
const {
  getTimeoutHosts,
  getHostZabbix,
  claimZabbixToken,
  getLinkError,
  getHostsRaw,
  getItemsRaw,
  getItemHistoryRaw,
} = telegramController;

const sendTriggerEveryHour = (ctx) => {
  setInterval(async () => {
    try {
      const timeoutMessage = await getTimeoutHosts();
      const linkMessage = await getLinkError();
      const finalMessage = `${timeoutMessage}\n\n${linkMessage}`;
      await ctx.reply(finalMessage);
    } catch (err) {
      console.error("Error saat kirim pesan:", err.stack || err.message);
      await ctx.reply("Terjadi kesalahan saat mengambil data.");
    }
  }, 3600000);
};

const getHosts = async (ctx) => {
  try {
    const message = await getHostZabbix();
    await ctx.reply(message);
  } catch (err) {
    console.error("Error saat kirim pesan:", err);
    await ctx.reply("Terjadi kesalahan saat mengambil data.");
  }
};

const getLinkDown = async (ctx) => {
  try {
    const message = await getLinkError();
    await ctx.reply(message);
  } catch (err) {
    console.error("Error saat kirim pesan:", err);
    await ctx.reply("Terjadi kesalahan saat mengambil data.");
  }
};

const getHostsInactive = async (ctx) => {
  try {
    const message = await getTimeoutHosts();
    await ctx.reply(message);
  } catch (err) {
    console.error("Error saat kirim pesan:", err);
    await ctx.reply("Terjadi kesalahan saat mengambil data.");
  }
};

const getTokenZabbix = async (ctx) => {
  try {
    const message = await claimZabbixToken();
    await ctx.reply(message);
  } catch (err) {
    console.error("Error saat kirim pesan:", err);
    await ctx.reply("Terjadi kesalahan saat mengambil data.");
  }
};

const getTrafficSelection = async (ctx) => {
  try {
    const hosts = await getHostsRaw();
    if (hosts.length === 0) return ctx.reply("Tidak ada host ditemukan.");

    const buttons = hosts.map((h) =>
      Markup.button.callback(h.name, `traffic_${h.hostid}`)
    );
    // Group buttons into rows of 2
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      keyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply(
      "Pilih Host untuk melihat rata-rata trafik hari ini:",
      Markup.inlineKeyboard(keyboard)
    );
  } catch (err) {
    console.error(err);
    ctx.reply("Gagal mengambil daftar host.");
  }
};

const getTempSelection = async (ctx) => {
  try {
    const hosts = await getHostsRaw();
    ctx.reply("Mencari host yang memiliki sensor suhu...");

    const validHosts = [];
    for (const h of hosts) {
      const items = await getItemsRaw(h.hostid, "temp");
      if (items.length > 0) {
        validHosts.push(h);
      }
    }

    if (validHosts.length === 0)
      return ctx.reply("Tidak ada host dengan sensor suhu.");

    const buttons = validHosts.map((h) =>
      Markup.button.callback(h.name, `temp_${h.hostid}`)
    );
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      keyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply(
      "Pilih Host untuk melihat temperatur:",
      Markup.inlineKeyboard(keyboard)
    );
  } catch (err) {
    console.error(err);
    ctx.reply("Gagal mencari host dengan sensor suhu.");
  }
};

const handleCallback = async (ctx) => {
  const data = ctx.callbackQuery.data;
  const [action, hostid] = data.split("_");

  if (action === "traffic") {
    await ctx.answerCbQuery("Menghitung trafik...");
    try {
      const items = await getItemsRaw(hostid, "net.if.");
      if (items.length === 0) return ctx.reply("Item trafik tidak ditemukan.");

      const now = Math.floor(Date.now() / 1000);
      const startOfDay = new Date().setHours(0, 0, 0, 0) / 1000;

      let report = `📊 Rata-rata Trafik Hari Ini:\n`;
      for (const item of items) {
        if (item.key_.includes("in") || item.key_.includes("out")) {
          const history = await getItemHistoryRaw(
            item.itemid,
            startOfDay,
            item.value_type
          );
          if (history.length > 0) {
            const sum = history.reduce(
              (acc, curr) => acc + parseFloat(curr.value),
              0
            );
            const avg = sum / history.length;
            const mbps = ((avg * 8) / 1000000).toFixed(2);
            report += `- ${item.name}: ${mbps} Mbps\n`;
          } else {
            report += `- ${item.name}: No data\n`;
          }
        }
      }
      await ctx.reply(report);
    } catch (err) {
      console.error(err);
      ctx.reply("Gagal menghitung trafik.");
    }
  } else if (action === "temp") {
    await ctx.answerCbQuery("Mengambil suhu...");
    try {
      const items = await getItemsRaw(hostid, "temp");
      let report = `🌡️ Temperatur Perangkat:\n`;
      for (const item of items) {
        report += `- ${item.name}: ${item.lastvalue} ${item.units || ""}\n`;
      }
      await ctx.reply(report);
    } catch (err) {
      console.error(err);
      ctx.reply("Gagal mengambil data temperatur.");
    }
  }
};

export default {
  sendTriggerEveryHour,
  getHosts,
  getTokenZabbix,
  getHostsInactive,
  getLinkDown,
  getTrafficSelection,
  getTempSelection,
  handleCallback,
};
