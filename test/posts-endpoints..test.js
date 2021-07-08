const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const { set } = require("../src/app");
const app = require("../src/app");
const helpers = require("./helpers");

describe("Posts Endpoints", () => {
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

  describe("POST /api/posts", () => {
    beforeEach(() => helpers.seedPosts(db, testAdmins, testPosts));

    const requiredFields = ["title", "content"];
    requiredFields.forEach((field) => {
      const newPost = {
        title: "test new post",
        content: "test content for days on end without stopping ever",
      };

      it(`Responds 400 ERROR and message when '${field}', is missing`, () => {
        delete newPost[field];

        return supertest(app)
          .post("/api/posts")
          .set("Authorization", helpers.makeAuthHeader(testAdmin))
          .send(newPost)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`Responds "401 NOT AUTHORIZED" when JWT is not present`, () => {
      const newPost = {
        title: "test new post",
        content: "test content for days on end without stopping ever",
      };

      return supertest(app).post("/api/posts").send(newPost).expect(401, {
        error: "NOT AUTHORIZED",
      });
    });

    it(`Responds 201 and creates new post`, () => {
      const newPost = {
        title: "test new post",
        content: "test content for days on end without stopping ever",
      };

      return supertest(app)
        .post("/api/posts")
        .set("Authorization", helpers.makeAuthHeader(testAdmin))
        .send(newPost)
        .expect(201)
        .then((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("date_created");
          expect(res.body.title).to.eql(newPost.title);
          expect(res.body.content).to.eql(newPost.content);
          expect(res.body.admin_id).to.eql(1);
        });
    });
  });

  describe("PATCH /api/posts/:id", () => {
    beforeEach(() => helpers.seedPosts(db, testAdmins, testPosts));
    it("Responds 401 NOT AUTHORIZED when JWT is not present", () => {
      const updatedPost = {
        title: "updated Title",
        content: "Content updated",
      };
      return supertest(app)
        .patch("/api/posts/1")
        .send(updatedPost)
        .expect(401, {
          error: "NOT AUTHORIZED",
        });
    });

    it("Responds 400, req body must contain fields", () => {
      return supertest(app)
        .patch("/api/posts/1")
        .set("authorization", helpers.makeAuthHeader(testAdmin))
        .send({})
        .expect(400, {
          error: "Request body must contain fields either 'title' or 'content'",
        });
    });

    context("204 updated responses", () => {
      it("Responds 204 when no content is present", () => {
        const updatedPost = { title: "Title Update" };
        const expectedPost = {
          ...testPost,
          title: "Title Update",
        };
        return supertest(app)
          .patch("/api/posts/1")
          .set("Authorization", helpers.makeAuthHeader(testAdmin))
          .send(updatedPost)
          .expect(204)
          .then(() =>
            supertest(app)
              .get("/api/posts/1")
              .set("Authorization", helpers.makeAuthHeader(testAdmin))
              .then((res) => {
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("date_created");
                expect(res.body.title).to.eql(expectedPost.title);
                expect(res.body.content).to.eql(expectedPost.content);
              })
          );
      });
      it("Responds 204 when no title is present", () => {
        const updatedPost = { content: "Content Update" };
        const expectedPost = {
          ...testPost,
          content: "Content Update",
        };
        return supertest(app)
          .patch("/api/posts/1")
          .set("Authorization", helpers.makeAuthHeader(testAdmin))
          .send(updatedPost)
          .expect(204)
          .then(() =>
            supertest(app)
              .get("/api/posts/1")
              .set("Authorization", helpers.makeAuthHeader(testAdmin))
              .then((res) => {
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("date_created");
                expect(res.body.title).to.eql(expectedPost.title);
                expect(res.body.content).to.eql(expectedPost.content);
              })
          );
      });
    });
  });

  describe("DELETE /api/posts/:id", () => {
    beforeEach(() => helpers.seedPosts(db, testAdmins, testPosts));
    it("Responds 401 'UNAUTHORIZED DELETE REQUEST'", () => {
      return supertest(app).delete("/api/posts/1").expect(401, {
        error: "NOT AUTHORIZED",
      });
    });
    it("Responds 204, no content", () => {
      return supertest(app)
        .delete("/api/posts/1")
        .set("Authorization", helpers.makeAuthHeader(testAdmin))
        .expect(204);
    });
  });
});
