const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const helpers = require("./helpers");

describe("Post Endpoints", () => {
  let db;
  const { testPosts, testAdmins } = helpers.makeFixtures();
  const testPost = testPosts[0];
  const testAdmin = testAdmins[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());
  before("cleanup", () => helpers.cleanTables(db));
  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /api/posts", () => {
    beforeEach(() => helpers.seedPosts(db, testAdmins, testPosts));

    it("Responds status code 200, with array of post objects", () => {
      let expectedArray = [];
      expectedArray.push(helpers.makeExpectedPost(testPost));
      return supertest(app)
        .get("/api/posts")
        .expect(200)
        .expect((res) => {
          expect(res.body[0]).to.have.property("id");
          expect(res.body[0]).to.have.property("admin_id");
          expect(res.body[0]).to.have.property("date_created");
          expect(res.body[0].title).to.eql(expectedArray[0].title);
          expect(res.body[0].content).to.eql(expectedArray[0].content);
        });
    });
  });
});
