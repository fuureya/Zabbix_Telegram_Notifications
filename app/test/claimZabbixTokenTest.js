import zabbixController from "../src/zabbixController.js";

const run = async () => {
  const result = await zabbixController.claimZabbixToken();
  console.log(result);
};

run();
