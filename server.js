const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({ static: __dirname });

server.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "index.html"));
});

server.use(middlewares);
server.use(router);

const port = Number(process.env.PORT) || 3000;
server.listen(port, "0.0.0.0", () => {
  console.log(`CRUDflix listening on port ${port}`);
});
