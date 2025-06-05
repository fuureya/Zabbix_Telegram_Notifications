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

    // Filter berdasarkan kata kunci SNMP
    const snmpKeywords = process.env.SNMP_TRIGGER_KEYWORDS
      ? process.env.SNMP_TRIGGER_KEYWORDS.split(",").map((k) => k.trim())
      : ["SNMP data collection"];

    const snmpIssueTriggers = response.data.result.filter((trigger) =>
      snmpKeywords.some((keyword) =>
        new RegExp(keyword, "i").test(trigger.description)
      )
    );

    // Ambil host dari trigger
    const hostsWithSnmpIssues = snmpIssueTriggers.map((t) => t.hosts).flat();

    // Buat list nama host jadi string
    const listNamaHost =
      hostsWithSnmpIssues.map((host) => host.host).join(", ") ||
      "Tidak ada host";

    // Format output string
    return `Jumlah host yang tidak aktif ada: ${hostsWithSnmpIssues.length}\nDaftar host yang tidak aktif: ${listNamaHost}`;
  } catch (error) {
    console.error("Error ambil host SNMP issue:", error.message);
    return `Error message: ${error.message}`;
  }
}

export default { claimZabbixToken, getHostZabbix, getTimeoutHosts };
