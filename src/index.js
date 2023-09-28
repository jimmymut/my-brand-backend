import app from "./app.js";
import mongoose from "mongoose";
import {
  port,
  test_port,
  dev_db,
  node_env,
  test_db,
  remote_db,
} from "./config";

mongoose.set("strictQuery", true);

if (node_env === "development") {
  mongoose
    .connect(dev_db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(port, () =>
        console.log("Conneted to localdb!\nServer is running at", port)
      );
    })
    .catch((err) => console.log(err));
} else if (node_env === "testing") {
  mongoose
    .connect(test_db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(test_port, () =>
        console.log("Conneted to testdb!\nServer is running at", test_port)
      );
    })
    .catch((err) => console.log(err));
} else {
  mongoose
    .connect(remote_db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(port, () =>
        console.log("Conneted to remotedb!\nServer is running at", port)
      );
    })
    .catch((err) => console.log(err));
}