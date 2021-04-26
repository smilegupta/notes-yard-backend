const uuid = require("uuid");
const { putItem, queryItems, deleteItem, updateItem } = require("../Utils/db-helpers");
const { getInputParams } = require("../Utils/inputHelper");

const NOTEBOOKS_TABLE = process.env.NOTEBOOKS_TABLE;

// List of headers to be passed in the response
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  };

/**
 * @apiName Create Notebook
 * @apiGroup Notebook
 * @api {post} /Notebook    Create Notebook for a user

 * @apiParam {String} userId   userId of the person from whom the Notebook is getting created
 * @apiParam {String} notebookName   name of the Notebook

 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/notebook
 */
async function createNotebook(input) {
    const notebookId = uuid.v4();
    await putItem({
      TableName: NOTEBOOKS_TABLE,
      Item: {
        userId: input.userId,
        notebookId,
        createdAt: new Date().toISOString(),
        notebookName: input.notebookName,
        pattern: Math.floor(Math.random() * 21), // Total Nuber of patterns 21, randomly allocating a pattern index
        notesCount: 0
      }
    });
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({ notebookId})
    };
  }

/**
 * @apiName Get list of notebooks for a user
 * @apiGroup Notebook
 * @api {get} /notebook    Get list of notebooks for a user
 * @apiParam {String} notebookId     id of the notebook for which the data is requested for
 * @apiParam {String} userId           userId of the person logged-in
 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/notebook
 */
async function getNotebooksForUser(userId) {
    const res = await queryItems({
      TableName: NOTEBOOKS_TABLE,
      KeyConditionExpression: `userId=:userId`,
      ExpressionAttributeValues: { ":userId": userId }
    });
    const notebooks = res.Items;
    const sortedNotebooks = res.Items.length ? res.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ) : [];
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(sortedNotebooks)
    };
  }

/**
 * @apiName Delete Notebook
 * @apiGroup Notebook
 * @api {delete} /notebook/{notebookId}   Delete user's notebooks
 *
 * @apiParam {String} notebookId       id of the notebook for which the data is requested for
 * @apiParam {String} userId           userId of the person logged-in
 *
 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/notebook/{notebookId}
 */

async function deleteNotebook(notebookId, userId) {
    await deleteItem({
      TableName: NOTEBOOKS_TABLE,
      Key: {
        notebookId,
        userId
      }
    });
    return {
      headers,
      statusCode: 204,
      body: "Notebook Deleted Successfully"
    };
  }

/**
 * @apiName Update Notebook
 * @apiGroup Notebook
 * @api {put} /notebook/{notebookId}   Update user's Notebooks
 *
 * @apiParam {String} notebookId     id of the notebook for which the data is requested for
 * @apiParam {String} userId         userId of the person logged-in
 * @apiParam {String} notebookName   name of the notebook 

 *
 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/notebook/{notebookId}
 */

async function updateNotebook(notebookId, body) {
    await updateItem({
      TableName: NOTEBOOKS_TABLE,
      Key: {
        notebookId,
        userId: body.userId
      },
      UpdateExpression:
        "set notebookName = :notebookName",
      ExpressionAttributeValues: {
        ":notebookName": body.notebookName,
      },
      ReturnValues: "UPDATED_NEW"
    });
    return {
      headers,
      statusCode: 200,
      body: "Notebook Updated Successfully"
    };
  }

exports.handler = async (event) => {
    const {
      resource,
      body,
      httpMethod,
      queryParams,
      pathParams
    } = getInputParams(event);
  
    // creating a new Notebook
    if (httpMethod === "POST" && resource === "/notebook") {
      return createNotebook(body);
    }
  
    // Get list of Notebooks for a user
    if (httpMethod === "GET" && resource === "/notebook") {
      const { userId } = queryParams;
      return getNotebooksForUser(userId);
    }
  
    // Deleting a Notebook
    if (httpMethod === "DELETE" && resource === "/notebook/{notebookId}") {
      const { notebookId } = pathParams;
      const { userId } = queryParams;
      return deleteNotebook(notebookId, userId);
    }
  
    // Updating a Notebook
    if (httpMethod === "PUT" && resource === "/notebook/{notebookId}") {
      const { notebookId } = pathParams;
      return updateNotebook(notebookId, body);
    }
  };
  