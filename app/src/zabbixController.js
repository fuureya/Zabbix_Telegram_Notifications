import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function claimZabbixToken() {
  try {
    const response = await axios.post(
      process.env.ZABBIX_BASE_URL,
      {
        jsonrpc: "2.0",
        method: "user.login",
        params: {
          username: process.env.ZABBIX_USERNAME,
          password: process.env.ZABBIX_PASSWORD,
        },
        id: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const token = response.data.result;
    return `Token kamu: ${token}`;
  } catch (error) {
    console.error("Error login ke Zabbix:", error.message);
    return `Gagal login ke Zabbix: ${error.message}`;
  }
}

async function getHostZabbix() {
  try {
    const response = await axios.post(
      process.env.ZABBIX_BASE_URL,
      {
        jsonrpc: "2.0",
        method: "host.get",
        params: {
          output: ["host"],
        },
        id: 2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZABBIX_TOKEN}`,
        },
      }
    );

    const hosts = response.data.result;
    const hostCount = Array.isArray(hosts) ? hosts.length : 0;
    const hostNames = hosts.map((h) => `- ${h.host}`).join("\n");

    return `Jumlah host ada: ${hostCount}\nDaftar host:\n${hostNames}`;
  } catch (error) {
    console.error("Error ambil host Zabbix:", error.message);
    return `Terjadi kesalahan saat mengambil data host: ${error.message}`;
  }
}

async function getTimeoutHosts() {
  try {
    const response = await axios.post(
      process.env.ZABBIX_BASE_URL,
      {
        jsonrpc: "2.0",
        method: "trigger.get",
        params: {
          output: [
            "triggerid",
            "description",
            "priority",
            "lastchange",
            "value",
          ],
          filter: {
            value: 1,
          },
          selectHosts: ["hostid", "host"],
          sortfield: "lastchange",
          sortorder: "DESC",
          monitored: true,
        },
        id: 3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZABBIX_TOKEN}`,
        },
      }
    );

    const snmpKeywords = process.env.SNMP_TRIGGER_KEYWORDS
      ? process.env.SNMP_TRIGGER_KEYWORDS.split(",").map((k) => k.trim())
      : ["SNMP data collection"];

    const snmpIssueTriggers = response.data.result.filter((trigger) =>
      snmpKeywords.some((keyword) =>
        new RegExp(keyword, "i").test(trigger.description)
      )
    );
    const hostsWithSnmpIssues = snmpIssueTriggers.map((t) => t.hosts).flat();

    const listNamaHost =
      hostsWithSnmpIssues.map((host) => host.host).join(", ") ||
      "Tidak ada host";

    return `Jumlah host yang tidak aktif ada: ${hostsWithSnmpIssues.length}\nDaftar host yang tidak aktif: ${listNamaHost}`;
  } catch (error) {
    console.error("Error ambil host SNMP issue:", error.message);
    return `Error message: ${error.message}`;
  }
}

async function getLinkError() {
  try {
    const response = await axios.post(
      process.env.ZABBIX_BASE_URL,
      {
        jsonrpc: "2.0",
        method: "trigger.get",
        params: {
          output: [
            "triggerid",
            "description",
            "priority",
            "lastchange",
            "value",
          ],
          filter: {
            value: 1, // aktif (problem) trigger
          },
          selectHosts: ["hostid", "host"],
          sortfield: "lastchange",
          sortorder: "DESC",
          monitored: true,
        },
        id: 4,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZABBIX_TOKEN}`,
        },
      }
    );

    const linkErrorKeywords = process.env.LINK_ERROR_KEYWORDS
      ? process.env.LINK_ERROR_KEYWORDS.split(",").map((k) => k.trim())
      : ["Link down", "Interface", "port down"]; // kamu bisa tambahkan keyword lain jika diperlukan

    const linkErrorTriggers = response.data.result.filter((trigger) =>
      linkErrorKeywords.some((keyword) =>
        new RegExp(keyword, "i").test(trigger.description)
      )
    );

    const hostsWithLinkErrors = linkErrorTriggers.map((t) => ({
      host: t.hosts[0]?.host || "Unknown Host",
      description: t.description,
    }));

    if (hostsWithLinkErrors.length === 0) {
      return "Tidak ada host dengan link error.";
    }

    const listDetail = hostsWithLinkErrors
      .map((item, i) => `${i + 1}. ${item.host} - ${item.description}`)
      .join("\n");

    return `Jumlah host dengan link error: ${hostsWithLinkErrors.length}\n\nDetail:\n${listDetail}`;
  } catch (error) {
    console.error("Error ambil link error:", error.message);
    return `Error message: ${error.message}`;
  }
}

async function getTrafficRouters() {
  const ZABBIX_API = process.env.ZABBIX_BASE_URL;
  const TOKEN = process.env.ZABBIX_TOKEN;

  const routers = process.env.ZABBIX_ROUTERS
    ? process.env.ZABBIX_ROUTERS.split(",").map((r) => r.trim())
    : [];

  const now = Math.floor(Date.now() / 1000);
  const oneHourAgo = now - 3600;

  let report = "📊 Trafik 1 Jam Terakhir:\n";

  for (const routerName of routers) {
    try {
      // 1. Ambil host dari nama router
      const hostRes = await axios.post(
        ZABBIX_API,
        {
          jsonrpc: "2.0",
          method: "host.get",
          params: {
            filter: { host: "Core Mikrotik FK Unhas" },
            output: ["hostid", "host", "name"],
          },
          auth: TOKEN,
          id: 1,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const hostList = hostRes.data.result;

      console.log(hostList);
      // if (!hostList || hostList.length === 0) {
      //   report += `❌ Router "${routerName}" tidak ditemukan di Zabbix\n`;
      //   continue;
      // }

      const host = hostList[0];

      // 2. Ambil item trafik in/out
      const itemRes = await axios.post(
        ZABBIX_API,
        {
          jsonrpc: "2.0",
          method: "item.get",
          params: {
            hostids: host.hostid,
            search: {
              key_: "net.if.",
            },
            output: ["itemid", "name", "key_"],
          },
          auth: TOKEN,
          id: 2,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const items = itemRes.data.result.filter(
        (item) => item.key_.includes("in") || item.key_.includes("out")
      );

      if (items.length === 0) {
        report += `⚠️ Tidak ditemukan item trafik untuk "${routerName}"\n`;
        continue;
      }

      report += `\n📡 Router: ${routerName}\n`;

      for (const item of items) {
        const historyRes = await axios.post(
          ZABBIX_API,
          {
            jsonrpc: "2.0",
            method: "history.get",
            params: {
              history: 3,
              itemids: item.itemid,
              time_from: oneHourAgo,
              time_till: now,
              sortfield: "clock",
              sortorder: "DESC",
              limit: 1,
            },
            auth: TOKEN,
            id: 3,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const latest = historyRes.data.result?.[0];
        if (latest) {
          const mbps = ((parseFloat(latest.value) * 8) / 1000000).toFixed(2);
          report += `- ${item.name}: ${mbps} Mbps\n`;
        } else {
          report += `- ${item.name}: tidak ada data\n`;
        }
      }
    } catch (err) {
      console.error(`❌ Gagal ambil data router ${routerName}:`, err.message);
      report += `❌ Error pada router "${routerName}": ${err.message}\n`;
    }
  }

  return report;
}

export default {
  claimZabbixToken,
  getHostZabbix,
  getTimeoutHosts,
  getTrafficRouters,
  getLinkError,
};
