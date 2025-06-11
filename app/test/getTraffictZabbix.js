import zabbixController from "../src/zabbixController.js";

const run = async () => {
  const result = await zabbixController.getTrafficRouters();
  console.log(result);
};

run();
