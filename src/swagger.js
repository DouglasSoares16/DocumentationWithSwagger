const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Documentation API Rest",
    description: "A docs of API Rest",
    version: "1.0.0",
    contact: {
      email: "douglassoares16.dev@gmail.com"
    },
    host: 'localhost:3333'
  },
  definitions: {
    User: {
      name: "Douglas",
      username: "douglas"
    },
    Todo: {
      title: "Run",
      deadline: "2022-03-01T01:10:00"
    },
    GetTodo: {
      id: "uuidv4",
      title: "Run",
      done: false,
      deadline: "2022-03-01T01:10:00",
      created_at: "202-02-01T01:10:00"
    }
  }
};

const outputFile = "swagger-output.json";
const endpointsFiles = ["src/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);