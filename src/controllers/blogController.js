import { Blog, Comment, Like } from "../models/blogModel";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import "dotenv/config";
import { result } from "lodash";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllBlogs = async (req, res) => {
  await Blog.find()
    .then((blogs) => {
      res.status(200).json(blogs);
    })
    .catch(() => {
      res.status(500).json({ Error: "Error occured!" });
    });
};

const addBlog = async (req, res) => {
  const { title, description } = req.body;
  cloudinary.uploader
    .upload(req.body.file, {
      folder: "images",
    })
    .then(async (uploadedImage) => {
      const blogs = new Blog({
        title,
        description,
        file: {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        },
      });
      await blogs
        .save()
        .then((result) => {
          res.status(200).json(result);
        })
        .catch(() => {
          res.status(500).json({ Error: "Failed to create a blog" });
        });
    })
    .catch(() => {
      res.status(500).json({ Error: "Something went wrong!" });
    });
};

const getNumberAllBlogs = async (req, res) => {
  Blog.find()
    .then((result) => {
      res.status(200).json({ Blogs: result.length });
    })
    .catch((err) => {
      res.status(500).json({ Message: "Error occured!" });
    });
};

const getSingleBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  Blog.findOne({ _id: id })
    .then((blog) => {
      if (!blog) {
        return res.status(404).json("No blog found!");
      }
      res.status(200).json(blog);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

const updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Blog.findOne({ _id: id });
    if (!post) {
      return res.status(404).json({ error: "Blog doesn't exist!" });
    }
    if (req.body.title) {
      post.title = req.body.title;
    }

    if (req.body.description) {
      post.description = req.body.description;
    }
    if (req.body.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.body.file, {
        folder: "images",
      });
      post.file.public_id = uploadedImage.public_id;
      post.file.url = uploadedImage.secure_url;
    }

    await post.save();
    res.status(200).json(post);
  } catch {
    res.status(500).json({ error: "Server error!" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid id");
    }
    const exist = await Blog.findById(id);
    if (!exist) {
      return res.status(404).json({ error: "Blog doesn't exist!" });
    }
    await Blog.deleteOne({ _id: id });
    const blogLikes = await Like.find({ blogId: id });
    if (!blogLikes) {
      const blogComments = await Comment.find({ blogId: id });
      if (!blogComments) {
        res.status(204).json({ Message: "blog deleted" });
      } else {
        await Comment.deleteMany({ blogId: id });
        res.status(204).json({ Message: "blog deleted" });
      }
    } else {
      await Like.deleteMany({ blogId: id });
      const blogComments = await Comment.find({ blogId: id });
      if (!blogComments) {
        res.status(204).json({ Message: "blog deleted" });
      } else {
        await Comment.deleteMany({ blogId: id });
        res.status(204).json({ Message: "blog deleted" });
      }
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const allComments = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  await Blog.findById(id)
    .then((blog) => {
      if (!blog) {
        return res.status(404).json("No blog found!");
      }
      res.status(200).json(blog.comments);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

const numberOfBlogComments = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid blog id");
  }
  const exist = await Blog.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "Blog doesn't exist!" });
  }

  Comment.find({ blogId: id })
    .then((result) => {
      res.status(200).json({ comments: result.length });
    })
    .catch((err) => res.status(500).json(err));
};

const addComment = async (req, res) => {
  const id = req.params.id;
  const exist = await Blog.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "Blog doesn't exist!" });
  }

  const { name, comment } = req.body;
  const newcomment = new Comment({
    name,
    comment,
    blogId: id,
  });

  newcomment
    .save()
    .then(async (savedCmt) => {
      Blog.findByIdAndUpdate(id, { $push: { comments: newcomment } })
        .then(() => {
          res.status(200).json(savedCmt);
        })
        .catch(() => {
          res.status(500).json({ error: "Error occurred on blog update" });
        });
    })
    .catch(() => {
      res.status(500).json({ error: "Failed to save a comment" });
    });
};

const deleteComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send("Invalid blog id");
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment id");
    }
    const exist = await Blog.findById(blogId);
    if (!exist) {
      return res.status(404).json({ error: "Blog doesn't exist!" });
    }

    const commentExist = await Comment.findById(commentId);

    await Comment.deleteOne({ _id: commentExist._id });

    await Blog.findByIdAndUpdate(blogId, { $pull: { comments: commentExist } });
    res.status(200).json("Comment deleted!");
  } catch (error) {
    res.status(500).json(error);
  }
};
const getSingleComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const commentId = req.params.commentId;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).send("Invalid blog id");
    }
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).send("Invalid comment id");
    }
    const blogExist = await Blog.findById(blogId);
    if (!blogExist) {
      return res.status(404).json({ error: "Blog doesn't exist!" });
    }
    const commentExist = await Comment.findById(commentId);
    if (!commentExist) {
      return res.status(404).json({ error: "Comment doesn't exist!" });
    }
    res.status(200).json(commentExist);
  } catch (error) {
    res.status(500).json(error);
  }
};

const likeBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const exist = await Blog.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "Blog doesn't exist!" });
  }
  const newUserId = req.user._id;
  Like.findOne({ $and: [{ blogId: id }, { userId: newUserId }] }).then(
    async (liked) => {
      if (liked) {
        const like_id = liked._id;
        Blog.updateOne(
          { _id: id },
          {
            $pull: {
              likes: like_id,
            },
          },
          { new: true }
        )
          .then(async () => {
            Like.findOneAndDelete({ _id: like_id })
              .then(async () => {
                const blg = await Blog.findById(id);
                res.status(200).json({ likes: blg.likes.length });
              })
              .catch((error) => {
                res.status(500).json({ error });
              });
          })
          .catch(() => {
            return res.status(500).json({ error: "error occured!" });
          });
      } else {
        const like = new Like({
          blogId: id,
          userId: req.user._id,
        });
        await like.save().then(async () => {
          await Blog.updateOne(
            { _id: id },
            { $push: { likes: like._id } },
            { new: true }
          )
            .then(async () => {
              const art = await Blog.findById(id);
              res.status(200).json({ likes: art.likes.length });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        });
      }
    }
  );
};
const likesOnBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const exist = await Blog.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "Blog doesn't exist!" });
  }
  Blog.findById(id)
    .then((blog) => {
      res.status(200).json({ likes: blog.likes.length });
    })
    .catch(() => {
      res.status(500).json({ error: "error occured!" });
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
  deleteComment,
  numberOfBlogComments,
  getNumberAllBlogs,
  getSingleComment,
};
