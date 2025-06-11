import zabbixController from "../src/zabbixController.js";

const run = async () => {
  const result = await zabbixController.getLinkError();
  console.log(result);
};

run();
