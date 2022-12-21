import { Blog, Comment } from "../models/blogModel";

const getAllBlogs = async (req, res) => {
  await Blog.find()
    .populate("comments")
    .then((blogs) => {
      res.json(blogs);
    })
    .catch(() => {
      res.status(404).json({ Error: "No blog found!" });
    });
};

const addBlog = async (req, res) => {
  const { title, description, file } = req.body;
  const blogs = new Blog({
    title,
    description,
    file,
    likes: 0,
    comments: [],
  });
  await blogs
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.status(500).json({ Error: "Failed to create a blog" });
    });
};

const getSingleBlog = async (req, res) => {
  await Blog.findOne({ _id: req.params.id })
    .populate("comments")
    .then((blog) => {
      res.json(blog);
    })
    .catch(() => {
      res.status(404).json({ Error: "No blog found!" });
    });
};

const updateBlog = async (req, res) => {
  const post = await Blog.findOne({ _id: req.params.id });
  try {
    if (req.body.title) {
      post.title = req.body.title;
    }

    if (req.body.description) {
      post.description = req.body.description;
    }
    if (req.body.image) {
      post.image = req.body.image;
    }

    await post.save();
    res.json(post);
  } catch {
    res.status(404).json({ error: "Blog doesn't exist!" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    await Blog.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Blog doesn't exist!" });
  }
};

const allComments = async (req, res) => {
  await Blog.findById(req.params.id)
    .populate("comments")
    .then((blog) => {
      res.status(200).json(blog.comments);
    })
    .catch((error) => {
      console.log(error);
    });
};

const addComment = async (req, res) => {
  const id = req.params.id;
  const { name, comment } = req.body;
  const newcomment = new Comment({
    name,
    comment,
    blog: id,
  });
  await newcomment.save();
  const relatedBlog = await Blog.findById(id).populate("comments");
  relatedBlog.comments.push(newcomment);

  await relatedBlog
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ error: "Failed to save a comment" });
    });
};

const likeBlog = async (req, res) => {
  const id = req.params.id;
  await Blog.updateOne({ _id: id }, { $inc: { likes: 1 } })
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ error: "liking failed" });
    });
};
const likesOnBlog = async (req, res) => {
  const id = req.params.id;
  await Blog.findById(id)
    .then((result) => {
      res.json(result.likes);
    })
    .catch(() => {
      res.status(500).json({ error: "get likes failed" });
    });
};

export {
  getAllBlogs,
  addBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  addComment,
  likeBlog,
  allComments,
  likesOnBlog,
};
