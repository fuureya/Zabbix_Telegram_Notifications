import telegramController from "./zabbixController.js";
const { getTimeoutHosts, getHostZabbix, claimZabbixToken } = telegramController;

const sendTriggerFourHours = (ctx) => {
  setInterval(async () => {
    try {
      const message = await getTimeoutHosts();
      await ctx.reply(message);
    } catch (err) {
      console.error("Error saat kirim pesan:", err);
      await ctx.reply("Terjadi kesalahan saat mengambil data.");
    }
  }, 5000);
};

const getHosts = async (ctx) => {
  try {
    const message = await getHostZabbix(); // pastikan getHosts() mengembalikan string
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

export default { sendTriggerFourHours, getHosts, getTokenZabbix };
