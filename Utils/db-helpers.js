const aws = require("aws-sdk");
const { promisify } = require("util");

aws.config.update({ region: process.env.REGION });
const ddb = new aws.DynamoDB.DocumentClient();

ddb.putPromise = promisify(ddb.put);
ddb.updatePromise = promisify(ddb.update);
ddb.getPromise = promisify(ddb.get);
ddb.deletePromise = promisify(ddb.delete);
ddb.queryPromise = promisify(ddb.query);

const putItem = params =>
  ddb.putPromise(params).then(data => ({ message: "success" }));

const getItem = params => ddb.getPromise(params).then(data => data.Item);

const updateItem = params => ddb.updatePromise(params);

const deleteItem = params => ddb.deletePromise(params);

const queryItems = params => ddb.queryPromise(params);

module.exports = {
  putItem,
  getItem,
  updateItem,
  deleteItem,
  queryItems
};