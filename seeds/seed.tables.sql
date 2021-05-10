BEGIN;

TRUNCATE
  "admins",
  "posts";

INSERT INTO "admins" ("id", "admin_name", "password")
VALUES
  (
      1,
      'Danni Lee',
      -- password = "IN A TEXT FILE ON MY DEV WORKSTATION FIGHT ME FOR IT"
      '$2y$12$DmElcxF9yH4TVFsmd7eI/.e3Y2SeP1o2GF8A0kQ2t3CDy0jtPrP3e'
  );

INSERT INTO "posts" ("id", "title", "content", "admin_id")
VALUES
  (1, 'In The Begining', 'This is where post content will go. You will talk about what is going on with the projects and whatever else needs to happen.', 1),
  (2, 'In The Begining 2', 'This is where post content will go. You will talk about what is going on with the projects and whatever else needs to happen.', 1),
  (3, 'In The Begining 3', 'This is where post content will go. You will talk about what is going on with the projects and whatever else needs to happen.', 1),
  (4, 'In The Begining 4', 'This is where post content will go. You will talk about what is going on with the projects and whatever else needs to happen.', 1),
  (5, 'In The Begining 5', 'This is where post content will go. You will talk about what is going on with the projects and whatever else needs to happen.', 1);

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('admins_id_seq', (SELECT MAX(id) from "admins"));
SELECT setval('posts_id_seq', (SELECT MAX(id) from "posts"));

COMMIT;