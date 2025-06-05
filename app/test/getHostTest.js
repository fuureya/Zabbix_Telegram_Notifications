import zabbixController from "../src/zabbixController.js";

const run = async () => {
  const result = await zabbixController.getHost();
  console.log(result);
};

run();
