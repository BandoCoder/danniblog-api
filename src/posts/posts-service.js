const PostsService = {
  //CRUD
  insertPost(db, post) {
    return db
      .insert(post)
      .into("posts")
      .returning("*")
      .then(([post]) => post);
  },

  getPosts(db) {
    return db
      .from("posts")
      .select("*")
      .orderBy("date_created", "desc")
      .limit(50);
  },
  getPostById(db, id) {
    return db("posts").select("*").where({ id }).first();
  },
  updatePost(db, id, updatedPost) {
    return db("posts").where({ id }).update(updatedPost);
  },
  deletePost(db, id) {
    return db.from("posts").where({ id }).delete();
  },
};

module.exports = PostsService;
