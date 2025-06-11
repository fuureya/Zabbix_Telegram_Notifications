import telegramController from "./zabbixController.js";
const { getTimeoutHosts, getHostZabbix, claimZabbixToken, getLinkError } =
  telegramController;

const sendTriggerEveryHour = (ctx) => {
  setInterval(async () => {
    try {
      const timeoutMessage = await getTimeoutHosts();
      const linkMessage = await getLinkDown(ctx);
      const finalMessage = `${timeoutMessage}\n\n${linkMessage}`;
      await ctx.reply(finalMessage);
    } catch (err) {
      console.error("Error saat kirim pesan:", err.stack || err.message);
      await ctx.reply("Terjadi kesalahan saat mengambil data.");
    }
  }, 3600000); // 1 jam 3600000
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

export default {
  sendTriggerEveryHour,
  getHosts,
  getTokenZabbix,
  getHostsInactive,
  getLinkDown,
};
