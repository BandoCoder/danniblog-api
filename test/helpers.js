const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeAdminArray() {
  return [
    {
      id: 1,
      admin_name: "test-user-1",
      password: "Password123!",
    },
  ];
}

function makePostsArray() {
  return [
    {
      id: 1,
      title: "test-post-title-1",
      content: "test-post-content-1",
      date_created: "2029-01-22T16:28:32.615Z",
      admin_id: 1,
    },
    {
      id: 2,
      title: "test-post-title-2",
      content: "test-post-content-2",
      date_created: "2029-01-22T16:28:32.615Z",
      admin_id: 1,
    },
    {
      id: 3,
      title: "test-post-title-3",
      content: "test-post-content-3",
      date_created: "2029-01-22T16:28:32.615Z",
      admin_id: 1,
    },
    {
      id: 4,
      title: "test-post-title-4",
      content: "test-post-content-4",
      date_created: "2029-01-22T16:28:32.615Z",
      admin_id: 1,
    },
  ];
}

function makeExpectedPost(post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    date_created: post.date_created,
    admin_id: post.admin_id,
  };
}

function makeFixtures() {
  const testAdmins = makeAdminArray();
  const testPosts = makePostsArray();
  return { testAdmins, testPosts };
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        admins,
        posts
      `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE admins_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE posts_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('admins_id_seq', 0)`),
          trx.raw(`SELECT setval('posts_id_seq', 0)`),
        ])
      )
  );
}

function seedAdmins(db, admins) {
  const preppedadmins = admins.map((admin) => ({
    ...admin,
    password: bcrypt.hashSync(admin.password, 1),
  }));
  return db
    .into("admins")
    .insert(preppedadmins)
    .then(() =>
      db.raw(`SELECT setval('admins_id_seq', ?)`, [
        admins[admins.length - 1].id,
      ])
    );
}

function seedPosts(db, admins, posts) {
  return db.transaction(async (trx) => {
    await seedAdmins(trx, admins);
    await trx.into("posts").insert(posts);

    await trx.raw(`SELECT setval('posts_id_seq', ?)`, [
      posts[posts.length - 1].id,
    ]);
  });
}

function makeMaliciousPost() {
  const maliciousPost = {
    id: 111,
    title: 'malicious post title <script>alert("xss");</script>',
    content: 'malicious content <script>alert("xss");</script>',
    user_id: 1,
  };

  const expectedPost = {
    ...maliciousPost,
    title: 'malicious post title &lt;script&gt;alert("xss");&lt;/script&gt;',
    content: 'malicious content &lt;script&gt;alert("xss");&lt;/script&gt;',
  };

  return {
    maliciousPost,
    expectedPost,
  };
}

function seedMaliciousPost(db, admin, post) {
  return seedAdmins(db, [admin]).then(() => db.into("posts").insert([post]));
}

function makeAuthHeader(admin, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ admin_id: admin.id }, secret, {
    subject: admin.admin_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeAdminArray,
  makeFixtures,
  makeExpectedPost,
  cleanTables,
  seedAdmins,
  seedPosts,
  makeAuthHeader,
  makeMaliciousPost,
  seedMaliciousPost,
};
