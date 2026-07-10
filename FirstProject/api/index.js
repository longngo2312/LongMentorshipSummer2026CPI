import Database from "better-sqlite3";
import express from "express";

const app = express();
const db = new Database("./database.sqlite");
console.log("Connected to SQLite database at ./database.sqlite");

//middleware
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.listen(3001, () => {
  console.log("App listening at PORT: ", 3001);
});
