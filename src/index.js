import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import "dotenv/config";
import router from "./routes/routes.js";
import cors from "cors";
import passport from "passport";

const app = express();

mongoose.set("strictQuery", true);
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV === "development") {
  mongoose
    .connect(process.env.DB_LOCAL_DEV, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(PORT, () =>
        console.log("Conneted to localdb!\nServer is running at", PORT)
      );
    })
    .catch((err) => console.log(err));
} else if (process.env.NODE_ENV === "test") {
  mongoose
    .connect(process.env.TEST_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Conneted to testingdb!"))
    .catch((err) => console.log(err));
} else {
  mongoose
    .connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(PORT, () =>
        console.log("Conneted to remotedb!\nServer is running at", PORT)
      );
    })
    .catch((err) => console.log(err));
}

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(passport.initialize());

app.use("/", router);

export default app;
