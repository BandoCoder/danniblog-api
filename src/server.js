const knex = require("knex");
const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");

if (process.env.NODE_ENV === "production") {
  const pg = require("pg");
  pg.defaults.ssl = { rejectUnauthorized: false };
}

//Initialize Knex
const db = knex({
  client: "pg",
  connection: DATABASE_URL,
});

app.set("db", db);

//Listen Port
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
