import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           default: Build your first REST api
 *         description:
 *           type: string
 *           default: Lorem ipsum dolor sit amet consectetur adipisicing elit. Non maxime, illum possimus repudiandae quod doloribus ab iste blanditiis maiores facere nisi! At repellendus recusandae, rerum voluptatibus doloremque ducimus tenetur cum. Eius enim dignissimos ea, dolorem porro tempora temporibus nesciunt non perferendis quas suscipit rem blanditiis. Fuga sit, officia eaque repellat possimus tempore dicta praesentium, accusamus rerum enim nobis corrupti natus, quam quod aspernatur autem dolorum accusantium sunt modi amet et. Aspernatur, omnis. Atque repellendus sapiente ipsa, eveniet rem molestiae, adipisci similique, eius cum at quidem perspiciatis cupiditate laudantium quas corrupti eum! Tenetur esse dolorum reprehenderit saepe! Ipsum ut quisquam voluptatibus culpa temporibus, praesentium laborum qui sequi earum quam aperiam, voluptatum, repellat officiis odio. Aspernatur animi incidunt ex iure aliquid, eaque labore eligendi veniam dicta, ad, eos accusantium quae pariatur alias aliquam dolore! Animi placeat id fugiat deleniti vel ea ut quibusdam autem ex sint possimus eius facere illum eum commodi, veniam consequuntur enim nemo saepe suscipit. Doloribus reiciendis eius, pariatur quae quos eveniet nulla ut impedit dolores est soluta omnis laboriosam deserunt cumque dolorum molestias totam sunt aut veritatis molestiae, amet tempore obcaecati voluptatum nesciunt. Nemo sequi magnam non maiores ipsum provident sint similique quae, debitis deserunt, hic repellat totam perspiciatis quis neque, velit eos saepe officia. Architecto, provident recusandae sint fugiat ut nobis totam mollitia quam, natus, adipisci doloremque? Facere provident, voluptatibus cum cupiditate aliquam doloribus reprehenderit minus iure enim? Voluptate consequuntur vitae consectetur, eaque quae magni architecto dolorem expedita ea eligendi doloremque hic totam voluptatem sed odio esse aperiam, ducimus, repudiandae alias illo tempore. Molestias nesciunt voluptatum, veniam possimus adipisci vitae beatae ipsa quod atque amet repudiandae quia exercitationem placeat earum odio obcaecati quos perferendis, ipsam quibusdam excepturi eaque rerum magnam sint. Ad blanditiis odit corporis tempore eveniet ea rerum adipisci impedit voluptatum. Repudiandae ipsum fugiat adipisci dolore.
 *         file:
 *           type: string
 *           default: "data:image/png;base64,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"
 *         likes:
 *           type: array
 *           default: []
 *         comments:
 *           type: array
 *           default: []
 *       required:
 *         - title
 *         - description
 *         - file
 *     UpdateBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           default: Build your first REST api
 *         description:
 *           type: string
 *           default: Lorem ipsum dolor sit amet consectetur adipisicing elit. Non maxime, illum possimus repudiandae quod doloribus ab iste blanditiis maiores facere nisi! At repellendus recusandae, rerum voluptatibus doloremque ducimus tenetur cum. Eius enim dignissimos ea, dolorem porro tempora temporibus nesciunt non perferendis quas suscipit rem blanditiis. Fuga sit, officia eaque repellat possimus tempore dicta praesentium, accusamus rerum enim nobis corrupti natus, quam quod aspernatur autem dolorum accusantium sunt modi amet et. Aspernatur, omnis. Atque repellendus sapiente ipsa, eveniet rem molestiae, adipisci similique, eius cum at quidem perspiciatis cupiditate laudantium quas corrupti eum! Tenetur esse dolorum reprehenderit saepe! Ipsum ut quisquam voluptatibus culpa temporibus, praesentium laborum qui sequi earum quam aperiam, voluptatum, repellat officiis odio. Aspernatur animi incidunt ex iure aliquid, eaque labore eligendi veniam dicta, ad, eos accusantium quae pariatur alias aliquam dolore! Animi placeat id fugiat deleniti vel ea ut quibusdam autem ex sint possimus eius facere illum eum commodi, veniam consequuntur enim nemo saepe suscipit. Doloribus reiciendis eius, pariatur quae quos eveniet nulla ut impedit dolores est soluta omnis laboriosam deserunt cumque dolorum molestias totam sunt aut veritatis molestiae, amet tempore obcaecati voluptatum nesciunt. Nemo sequi magnam non maiores ipsum provident sint similique quae, debitis deserunt, hic repellat totam perspiciatis quis neque, velit eos saepe officia. Architecto, provident recusandae sint fugiat ut nobis totam mollitia quam, natus, adipisci doloremque? Facere provident, voluptatibus cum cupiditate aliquam doloribus reprehenderit minus iure enim? Voluptate consequuntur vitae consectetur, eaque quae magni architecto dolorem expedita ea eligendi doloremque hic totam voluptatem sed odio esse aperiam, ducimus, repudiandae alias illo tempore. Molestias nesciunt voluptatum, veniam possimus adipisci vitae beatae ipsa quod atque amet repudiandae quia exercitationem placeat earum odio obcaecati quos perferendis, ipsam quibusdam excepturi eaque rerum magnam sint. Ad blanditiis odit corporis tempore eveniet ea rerum adipisci impedit voluptatum. Repudiandae ipsum fugiat adipisci dolore.
 *         file:
 *           type: string
 *           default: "data:image/png;base64,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"
 *     BlogResponse:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           default: Build your first REST api
 *         description:
 *           type: string
 *         file:
 *           type: object
 *           properties:
 *              public_id:
 *                type: string
 *              url:
 *                type: string
 *         likes:
 *           type: array
 *           default: []
 *         comments:
 *           type: array
 *           default: []
 *         createdAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         updatedAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         __v:
 *           type: number
 *           default: 0
 */
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    likes: {
      type: Array,
      default: [],
    },

    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     addComment:
 *       type: object
 *       properties:
 *         comment:
 *           type: string
 *           default: You are slowly getting there
 *       required:
 *         - comment
 *
 *     CommentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         name:
 *           type: string
 *           default: Jimmy Mutabazi
 *         comment:
 *           type: string
 *           default: You are slowly getting there
 *         blogId:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         userId:
 *           type: string
 *           format: objectId
 *           default: 63ac5fe55065aaae433a9758
 *         commentedAt:
 *           type: string
 *           default: 2023-01-07T12:47:20.359Z
 *         __v:
 *           type: number
 *           default: 0
 */
const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  commentedAt: {
    type: Date,
    default: Date.now,
  },
});

const likeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", likeSchema);

const Comment = mongoose.model("Comment", commentSchema);
const Blog = mongoose.model("Blog", blogSchema);

export { Blog, Comment, Like };
