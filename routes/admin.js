const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const router = express.Router();

const keys = require("../database/keys");
const Admin = require("../models/Admin");

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .json({ message: "Please fill out the required fields" });
  }

  let user;
  if (email) {
    user = await getAdmin(email, "");
    if (!user) {
      return res.status(422).json({ message: "Incorrect Email or Password" });
    }
  }

  bcrypt.compare(password, user.password).then(async (isMatch) => {
    if (isMatch) {
      const payload = { id: user.id, name: user.email };
      jwt.sign(payload, keys.secretOrKey, { expiresIn: "2d" }, (err, token) => {
        if (err) {
          console.log(err);
        }

        let custom = _.omit(user, ["password"]);
        let response = {};
        response.token = token;
        response = {
          ...response,
          ...{ data: custom.dataValues, message: "Login Successfully" },
        };
        return res.json(response);
      });
    } else {
      return res.status(422).json({ message: "Incorrect Email or Password" });
    }
  });
});

let getAdmin = async (email, id) => {
  let obj;
  if (email) {
    obj = { email };
  } else if (id) {
    obj = { id };
  }
  return await Admin.findOne({
    where: obj,
  })
    .then((user) => {
      if (user) {
        return user;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};

module.exports = { getAdmin, router };
