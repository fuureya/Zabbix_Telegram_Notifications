import zabbixController from "../src/zabbixController.js";

const run = async () => {
  const result = await zabbixController.getTimeoutHosts();
  console.log(result);
};

run();
