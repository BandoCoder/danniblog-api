const express = require("express");
const { requireAuth } = require("../jwt");
const PostsService = require("./posts-service");

const postsRouter = express.Router();
const jsonParser = express.json();

//Unauthroized route
postsRouter.route("/").get((req, res, next) => {
  PostsService.getPosts(req.app.get("db"))
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch(next);
});

//Routes that requirew Auth
postsRouter
  .route("/")
  .all(requireAuth)
  .post(jsonParser, (req, res, next) => {
    let db = req.app.get("db");

    const { title, content } = req.body;
    const newPost = { title, content };

    newPost.admin_id = req.admin.id;

    //Validate Request
    for (const field of ["title", "content"])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    PostsService.insertPost(db, newPost)
      .then((post) => {
        res.status(201).json(post);
      })
      .catch(next);
  });

postsRouter
  .route("/:id")
  .all(requireAuth)
  .all(checkPostExists)
  .get((req, res) => {
    res.json(res.post);
  })
  .patch(jsonParser, (req, res, next) => {
    let db = req.app.get("db");

    const { title, content } = req.body;
    const postToUpdate = { title, content };

    const numberOfValues = Object.values(postToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: "Request body must contain fields either 'title' or 'content'",
      });

    PostsService.updatePost(db, req.params.id, postToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    let db = req.app.get("db");

    PostsService.deletePost(db, req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

async function checkPostExists(req, res, next) {
  let db = req.app.get("db");

  try {
    const post = await PostsService.getPostById(db, req.params.id);

    if (!post)
      return res.status(404).json({
        error: "Pattern doesn't exist",
      });

    if (req.admin.id != post.admin_id) {
      return res.status(401).json({
        error: "Unauthorized request",
      });
    }

    res.post = post;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = postsRouter;
