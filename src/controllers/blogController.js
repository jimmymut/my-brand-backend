import { Blog, Comment, Like } from "../models/blogModel.js";
import mongoose from "mongoose";
import { cloudinary } from "../config";


const getAllBlogs = async (req, res) => {
  await Blog.find()
    .then((blogs) => {
      return res.status(200).json(blogs);
    })
    .catch(() => {
      return res.status(500).json({ Error: "Error occured!" });
    });
};

const addBlog = async (req, res) => {
  try {
    const { title, description, file } = req.validatedData;
    const uploadedImage = await cloudinary.uploader.upload(file, {
        folder: "images",
      });
      const blogs = new Blog({
        title,
        description,
        file: {
          public_id: uploadedImage.public_id,
          url: uploadedImage.secure_url,
        },
      });
      const result = await blogs.save();
      return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: "Something went wrong!" });
  }
};

const getNumberAllBlogs = async (req, res) => {
  Blog.countDocuments()
    .then((result) => {
      return res.status(200).json({ Blogs: result });
    })
    .catch((err) => {
      return res.status(500).json({ Message: `Error occured! ${err}` });
    });
};

const getSingleBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  Blog.findOne({ _id: id })
    .populate({
      path: "comments",
      populate: { path: "user", select: ["firstName", "lastName"] },
    })
    .then((blog) => {
      if (!blog) {
        return res.status(404).json("No blog found!");
      }
      return res.status(200).json(blog);
    })
    .catch((error) => {
      return res.status(500).json({ error: `Error occured! ${error}` });
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
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "images",
      });
      post.file.public_id = uploadedImage.public_id;
      post.file.url = uploadedImage.secure_url;
    }
    if (req.body.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.body.file, {
        folder: "images",
      });
      post.file.public_id = uploadedImage.public_id;
      post.file.url = uploadedImage.secure_url;
    }

    const updatedPost = await post.save();
    return res.status(200).json({ post: updatedPost });
  } catch (err) {
    return res.status(500).json({ error: `Error occured! ${err}` });
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
    await Like.deleteMany({ blogId: id });
    await Comment.deleteMany({ blogId: id });
    return res.status(204).json({ Message: "blog deleted!" });
  } catch (error) {
    return res.status(500).json({ error: `Error occured! ${error}` });
  }
};

const allComments = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  await Comment.find({ blogId: id })
    .populate({
      path: "user",
      select: ["firstName", "lastName"],
    })
    .then((comments) => {
      return res.status(200).json({ comments });
    })
    .catch((error) => {
      return res.status(500).json({ error: `Error occured! ${error}` });
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

  Comment.countDocuments({ blogId: id })
    .then((result) => {
      return res.status(200).json({ comments: result });
    })
    .catch((err) => res.status(500).json({ error: `Error occured! ${err}` }));
};

const addComment = async (req, res) => {
  const id = req.params.id;
  const exist = await Blog.findById(id);
  if (!exist) {
    return res.status(404).json({ error: "Blog doesn't exist!" });
  }
  const newUserId = req.user._id;
  const newcomment = new Comment({
    comment: req.body.comment,
    blogId: id,
    userId: newUserId,
    user: newUserId,
  });

  newcomment
    .save()
    .then(async (savedCmt) => {
      savedCmt.populate({
        path: "user",
        select: ["firstName", "lastName"],
      });
      Blog.findByIdAndUpdate(id, { $push: { comments: newcomment._id } })
        .then(() => {
          return res.status(200).json(savedCmt);
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ error: `Error occurred on blog update ${error}` });
        });
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ error: `Failed to save a comment ${error}` });
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
    if (!commentExist) {
      return res.status(404).json({ error: "Comment doesn't exist!" });
    }

    await Comment.deleteOne({ _id: commentExist._id });

    await Blog.findByIdAndUpdate(blogId, {
      $pull: { comments: commentExist._id },
    });
    return res.status(200).json("Comment deleted!");
  } catch (error) {
    return res.status(500).json({ error: `Error occured! ${error}` });
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
    const commentExist = await Comment.findById(commentId).populate({
      path: "user",
      select: ["firstName", "lastName"],
    });
    if (!commentExist) {
      return res.status(404).json({ error: "Comment doesn't exist!" });
    }
    return res.status(200).json(commentExist);
  } catch (error) {
    return res.status(500).json({ error: `Error occured! ${error}` });
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
                const blgLikes = await Like.countDocuments({ blogId: id });
                return res.status(200).json({ likes: blgLikes });
              })
              .catch((error) => {
                return res
                  .status(500)
                  .json({ error: `Error occured! ${error}` });
              });
          })
          .catch((error) => {
            return res.status(500).json({ error: `Error occured! ${error}` });
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
              const blgLikes = await Like.countDocuments({ blogId: id });
              return res.status(200).json({ likes: blgLikes });
            })
            .catch((error) => {
              return res.status(500).json({ error: `Error occured! ${error}` });
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
  await Like.countDocuments({ blogId: id })
    .then((blogLikes) => {
      return res.status(200).json({ likes: blogLikes });
    })
    .catch((error) => {
      return res.status(500).json({ error: `Error occured! ${error}` });
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
