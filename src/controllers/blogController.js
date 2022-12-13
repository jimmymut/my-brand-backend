import { Blog, Comment, Like } from "../models/blogModel";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  const { title, description } = req.body;
  const uploadedImage = await cloudinary.uploader.upload(req.body.file, {
    folder: "images",
  });
  const blogs = new Blog({
    title,
    description,
    file: {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    },
    likes: [],
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
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  await Blog.findOne({ id })
    .populate("comments")
    .then((blog) => {
      res.json(blog);
    })
    .catch(() => {
      res.status(404).json({ Error: "No blog found!" });
    });
};

const updateBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const post = await Blog.findOne({ id });
  try {
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
    res.json(post);
  } catch {
    res.status(404).json({ error: "Blog doesn't exist!" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid id");
    }
    await Blog.deleteOne({ id });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Blog doesn't exist!" });
  }
};

const allComments = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  await Blog.findById(id)
    .populate("comments")
    .then((blog) => {
      res.status(200).json(blog.comments);
    })
    .catch((error) => {
      res.status(400).json(error);
    });
};

const addComment = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const { name, comment } = req.body;
  const newcomment = new Comment({
    name,
    comment,
    blog: id,
  });
  await newcomment.save().catch(() => {
    res.status(500).json({ error: "Failed to save a comment" });
  });
  const relatedBlog = await Blog.findById(id).populate("comments");
  relatedBlog.comments.push(newcomment);

  await relatedBlog
    .save()
    .then(() => {
      res.status(200).json({ Message: "Comment saved" });
    })
    .catch(() => {
      res.status(500).json({ error: "Error occured!" });
    });
};

const likeBlog = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid id");
  }
  const newUserId = req.user._id;
  await Like.findOne({ $and: [{ blogId: id }, { userId: newUserId }] }).then(
    async (liked) => {
      if (liked) {
        const like_id = liked._id;
        Blog.updateOne(
          { _id: id },
          {
            $pull: {
              likes: { $and: [{ userId: liked.userId }, { _id: like_id }] },
            },
          },
          { new: true }
        )
          .then(async () => {
            Like.findOneAndDelete({ _id: like_id })
              .then(async () => {
                const blg = await Blog.findById(id);
                res.json({ likes: blg.likes.length });
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
            { $push: { likes: like } },
            { new: true }
          )
            .then(async () => {
              const art = await Blog.findById(id);
              res.json({ likes: art.likes.length });
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
  await Blog.findById(id)
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
};
