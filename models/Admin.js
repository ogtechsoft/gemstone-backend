const Sequelize = require("sequelize");
const db = require("../database/connection");

module.exports = db.sequelize.define(
  "admin",
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: 1,
  }
);
