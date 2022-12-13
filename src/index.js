import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import "dotenv/config";
import router from "./routes/routes";
import cors from "cors";
import passport from "passport";

const PORT = process.env.PORT || 3000;
mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.DB_LOCAL_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database conneted successfully!");
    const app = express();

    app.use(express.json());
    app.use(morgan("dev"));
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    // app.use(
    //   session({
    //     secret: process.env.SECRET_KEY,
    //     resave: false,
    //     saveUninitialized: false,
    //   })
    // );
    app.use(passport.initialize());

    app.use("/", router);

    app.listen(PORT, () => {
      console.log("Server is running at", PORT);
    });
  })
  .catch((error) => console.error(error));
