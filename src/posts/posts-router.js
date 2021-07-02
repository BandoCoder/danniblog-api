const express = require("express");
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

module.exports = postsRouter;
