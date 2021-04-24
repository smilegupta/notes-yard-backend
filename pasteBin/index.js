const uuid = require("uuid");
const { putItem, getItem } = require("../Utils/db-helpers");
const { getInputParams } = require("../Utils/inputHelper");

const PASTEBIN_TABLE = process.env.PASTEBIN_TABLE;

// List of headers to be passed in the response
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

/**
 * @apiName Create Pastebin
 * @apiGroup Pastebin
 * @api {post} /pasteBin    Create Pastebin

 * @apiParam {String} details   pastebin content

 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/pasteBin
 */
async function createPasteBin(input) {
  const pasteBinId = uuid.v4();
  await putItem({
    TableName: PASTEBIN_TABLE,
    Item: {
      pasteBinId,
      createdAt: new Date().toISOString(),
      details: input.details,
    }
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({ pasteBinId })
  };
}

/**
 * @apiName Get Pastebin
 * @apiGroup Pastebin
 * @api {get} /pasteBin/{pasteBinId}    Get Pastebin

 * @apiParam {String} pasteBinId   pastebin id

 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/pasteBin/{pasteBinId}
 */

async function getPasteBin(pasteBinId) {
  const res = await getItem({
    TableName: PASTEBIN_TABLE,
    Key:{
      pasteBinId
    }
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(res)
  }
}

exports.handler = async (event) => {
  const {
    resource,
    body,
    httpMethod,
    queryParams,
    pathParams,
  } = getInputParams(event);

  // creating a new pastebin
  if (httpMethod === "POST" && resource === "/pasteBin") {
    return createPasteBin(body);
  }

  // Getting pastebin
  if (httpMethod === "GET" && resource === "/pasteBin/{pasteBinId}") {
    const { pasteBinId } = pathParams;
    return getPasteBin(pasteBinId);
  }
};
