import app from "./app.js";
import mongoose from "mongoose";
import "dotenv/config";

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
