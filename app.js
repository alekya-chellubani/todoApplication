const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("server running at http://localhost:3005");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`);
    process.exit(1);
  }
};
initializeDBServer();
const checkScenario1 = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const checkScenario2 = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const checkScenario3 = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//GET API
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let data = null;
  let getDataQuery = "";
  switch (true) {
    case checkScenario1(request.query):
      getDataQuery = `
                SELECT
                *
                FROM
                todo 
                WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
      break;
    case checkScenario2(request.query):
      getDataQuery = `
                SELECT 
                * 
                FROM
                todo
                WHERE  
                priority = '${priority}';`;
      break;
    case checkScenario3(request.query):
      getDataQuery = `
                SELECT 
                * 
                FROM 
                todo
                WHERE status = '${status}';`;
      break;
    default:
      getDataQuery = `
                SELECT
                *
                FROM
                todo 
                WHERE
                todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getDataQuery);
  response.send(data);
});
//specific id API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT 
        *
        FROM
        todo
        WHERE
        id='${todoId}';`;
  const todoItem = await db.get(getTodoQuery);
  response.send(todoItem);
});
// POST todo API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
        INSERT INTO todo (id, todo, priority, status) VALUES 
        ('${id}', '${todo}', '${priority}', '${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});
const updateStatus = (requestBody) => {
  return;
  requestBody.status !== undefined;
};
const updatePriority = (requestBody) => {
  return;
  requestBody.priority !== undefined;
};
const updateTodo = (requestBody) => {
  return;
  requestBody.todo !== undefined;
};
// PUT todo API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
