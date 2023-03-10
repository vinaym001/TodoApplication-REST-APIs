const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1
const isPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const isStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const isStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;

  let apiQuery1 = "";

  switch (true) {
    case isPriority(request.query):
      apiQuery1 = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`;
      break;
    case isStatus(request.query):
      apiQuery1 = `SELECT * FROM todo WHERE todo  LIKE '%${search_q}%' AND status='${status}';`;
      break;
    case isStatusAndPriority(request.query):
      apiQuery1 = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority='${priority}';`;
      break;
    default:
      apiQuery1 = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      break;
  }

  const apiResponse1 = await db.all(apiQuery1);
  response.send(apiResponse1);
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let putResponse = null;
  let putQuery = "";
  let curr = null;
  switch (true) {
    case requestBody.status !== undefined:
      putQuery = `UPDATE todo SET status='${requestBody.status}' WHERE id=${todoId};`;
      curr = "Status";
      break;
    case requestBody.priority !== undefined:
      putQuery = `UPDATE todo SET priority='${requestBody.priority}' WHERE id=${todoId};`;
      curr = "Priority";
      break;
    case requestBody.todo !== undefined:
      putQuery = `UPDATE todo SET todo='${requestBody.todo}' WHERE id=${todoId};`;
      curr = "Todo";
      break;
    default:
      break;
  }
  putResponse = await db.run(putQuery);
  response.send(`${curr} Updated`);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});
