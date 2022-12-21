const express = require("express");
const passport = require("passport");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

require("./database/passport")(passport);

const admin = require("./routes/admin").router;
const certificate = require("./routes/certificate");
const attach = require("./routes/attach").router;

app.use(express.static("media"));
app.use("/media", express.static(path.join(__dirname, "media")));
app.use("/api", admin, certificate, attach);

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
