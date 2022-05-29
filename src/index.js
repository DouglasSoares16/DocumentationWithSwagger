const express = require('express');
const cors = require('cors');

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("../swagger-output.json");

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  swaggerOptions: {
    tryItOutEnabled: false,
    supportedSubmitMethods: [''],
  },
};

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile, swaggerOptions));

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  /*  
    #swagger.tags = ['Users']
    #swagger.description = 'Create a new user.' 
    #swagger.requestBody = {
       required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/User" } 
          }
        }
    }
  */

  const {
    name,
    username
  } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    /* #swagger.responses[400] = { schema: { error: "User already exists!" } } */
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  /* 
    #swagger.tags = ["Todos"] 
    #swagger.description = "List all Todos of a User"
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/GetTodo" }
    }
  */
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  /*  
    #swagger.tags = ['Todos']
    #swagger.description = 'Create a new todo.' 
    #swagger.requestBody = {
       required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/Todo" } 
          }
        }
    }
  */

  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  /* #swagger.responses[201] = {
    schema: { $ref: "#/definitions/GetTodo" }
  } */

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  /*  
    #swagger.tags = ['Todos']
    #swagger.description = 'Update a todo.' 
    #swagger.requestBody = {
       required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/definitions/Todo" } 
          }
        }
    }
  */
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  /* #swagger.responses[404] = { schema: { error: "Todo not found" } } */

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  /* #swagger.responses[200] = { schema: { $ref: "#/definitions/GetTodo" } } */

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  /* 
    #swagger.tags = ["Todos"]
    #swagger.description = "Update status of Todo" 
  */
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    /* #swagger.responses[404] = { schema: { error: "Todo not found" } } */
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  /* #swagger.responses[200] = { schema: { $ref: "#/definitions/GetTodo" } } */

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  /* 
    #swagger.tags = ["Todos"]
    #swagger.description = "Delete a Todo" 
  */
  const { id } = request.params;
  const { user } = request;

  // (findIndex) -> Retorna a posição dele no Array
  const todo = user.todos.findIndex(todo => todo.id === id);

  if (todo === -1) {
    /* #swagger.responses[404] = { schema: { error: "Todo not found" } } */
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;