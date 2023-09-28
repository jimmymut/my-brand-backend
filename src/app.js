import express from "express";
import morgan from "morgan";
import router from "./routes/routes.js";
import cors from "cors";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(passport.initialize());

app.use("/", router);

export default app;
