const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./helpers");
const supertest = require("supertest");

describe("Auth Endpoints", function () {
  let db;
  const { testAdmins } = helpers.makeFixtures();
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

  //admin_name & password
  describe("POST /api/auth/login", () => {
    beforeEach("insert admin", () => helpers.seedAdmins(db, testAdmins));

    const requiredFields = ["admin_name", "password"];

    //This runs a test for each field in the loginAttemptBody.
    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        admin_name: testAdmin.admin_name,
        password: testAdmin.password,
      };

      it(`Responds status 400 ERROR when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it("Responds 400 'Incorrect login credentials' when admin_name is incorrect", () => {
      const adminInvalidAdmin = {
        admin_name: "nope",
        password: "Password123!",
      };

      return supertest(app)
        .post("/api/auth/login")
        .send(adminInvalidAdmin)
        .expect(400, { error: "Incorrect login credentials" });
    });

    it("Responds 400 'Incorrect login credentials' when password is incorrect", () => {
      const adminInvalidPass = {
        admin_name: "test-user-1",
        password: "nope",
      };

      return supertest(app)
        .post("/api/auth/login")
        .send(adminInvalidPass)
        .expect(400, { error: "Incorrect login credentials" });
    });

    it("responds with 200 and JWT using secret when valid credentials", () => {
      const adminValidCreds = {
        admin_name: testAdmin.admin_name,
        password: testAdmin.password,
      };

      const expectedToken = jwt.sign(
        { admin_id: testAdmin.id },
        process.env.JWT_SECRET,
        {
          subject: testAdmin.admin_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .post("/api/auth/login")
        .send(adminValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });

  describe(`POST /api/auth/refresh`, () => {
    beforeEach("insert admin", () => helpers.seedAdmins(db, testAdmins));

    it(`Responds 200 and JWT using secret`, () => {
      const expectedToken = jwt.sign(
        { admin_id: testAdmin.id },
        process.env.JWT_SECRET,
        {
          subject: testAdmin.admin_name,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .put("/api/auth/refresh")
        .set("Authorization", helpers.makeAuthHeader(testAdmin))
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});
