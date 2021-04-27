const uuid = require("uuid");
const {
  putItem,
  queryItems,
  deleteItem,
  updateItem,
} = require("../Utils/db-helpers");
const { getInputParams } = require("../Utils/inputHelper");

const NOTES_TABLE = process.env.NOTES_TABLE;
const NOTEBOOKS_TABLE = process.env.NOTEBOOKS_TABLE;

// List of headers to be passed in the response
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

/**
 * @apiName Create Note
 * @apiGroup Notes
 * @api {post} /notebook/{notebookId}/note    Create Note for a user

 * @apiParam {String} userId   userId of the person from whom the Notebook is getting created
 * @apiParam {String} notebookId notebookId of the notebook
 * @apiParam {String} noteTitle   name of the noteTitle
 * @apiParam {String} note  content of the note

 * @apiContentType application/json
 * @apiSampleRequest https://nwebxyxksb.execute-api.ap-south-1.amazonaws.com/dev/notebook/{notebookId}/note
 */
async function createNote(notebookId, body) {
  const noteId = uuid.v4();
  await putItem({
    TableName: NOTES_TABLE,
    Item: {
      userId: body.userId,
      notebookId,
      noteId,
      createdAt: new Date().toISOString(),
      noteTitle: body.noteTitle,
      note: body.note,
    },
  });
  await updateItem({
    TableName: NOTEBOOKS_TABLE,
    Key: {
      notebookId,
      userId: body.userId,
    },
    UpdateExpression: "set notesCount = notesCount + :notesCount",
    ExpressionAttributeValues: {
      ":notesCount": 1,
    },
    ReturnValues: "UPDATED_NEW",
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({ noteId }),
  };
}

async function listNotes(notebookId) {
  console.log(`getting the list of notes for a notebook ${notebookId}`);
  const res = await queryItems({
    TableName: NOTES_TABLE,
    KeyConditionExpression: `notebookId=:notebookId`,
    ExpressionAttributeValues: { ":notebookId": notebookId },
  });
  const notes = res.Items;
  const sortedNotes = notes.length ? notes.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  ) : [];
  console.log("response being sent", {
    headers,
    statusCode: 200,
    body: JSON.stringify(sortedNotes)
  });
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(sortedNotes)
  };
}

async function deleteNote(notebookId, noteId, userId) {
    await deleteItem({
      TableName: NOTES_TABLE,
      Key: {
        notebookId,
        noteId
      }
    });
    await updateItem({
        TableName: NOTEBOOKS_TABLE,
        Key: {
          notebookId,
          userId
        },
        UpdateExpression: "set notesCount = notesCount - :notesCount",
        ExpressionAttributeValues: {
          ":notesCount": 1,
        },
        ReturnValues: "UPDATED_NEW",
      });
    return {
      headers,
      statusCode: 204,
      body: "Note Deleted Successfully"
    };
  }

  async function updateNote(notebookId,noteId, body) {
      console.log("notebookId", )
    await updateItem({
      TableName: NOTES_TABLE,
      Key: {
        notebookId,
        noteId
      },
      UpdateExpression:
        "set noteTitle = :noteTitle, note = :note",
      ExpressionAttributeValues: {
        ":noteTitle": body.noteTitle,
        ":note": body.note
      },
      ReturnValues: "UPDATED_NEW"
    });
    return {
      headers,
      statusCode: 200,
      body: "Note Updated Successfully"
    };
  }


exports.handler = async (event) => {
  const {
    resource,
    body,
    httpMethod,
    queryParams,
    pathParams,
  } = getInputParams(event);

  // creating a new Note
  if (httpMethod === "POST" && resource === "/notebook/{notebookId}/note") {
    const { notebookId } = pathParams;
    return createNote(notebookId, body);
  }

  // Get list of notes a note book have
  if (httpMethod === "GET" && resource === "/notebook/{notebookId}/note") {
    const { notebookId } = pathParams;
    return listNotes(notebookId);
  }

  // Deleting a note
  if (httpMethod === "DELETE" && resource === "/notebook/{notebookId}/note/{noteId}") {
    const { notebookId , noteId} = pathParams;
    const { userId } = queryParams;
    return deleteNote(notebookId, noteId, userId);
  }

  // Updating a note
  if (httpMethod === "PUT" && resource === "/notebook/{notebookId}/note/{noteId}") {
    const { notebookId, noteId } = pathParams;
    return updateNote(notebookId,noteId, body);
  }
};
