const Sequelize = require("sequelize");
require("dotenv").config({ path: "../.env" });
const db = {};

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST || "localhost",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME") {
          return field.string();
        }
        return next();
      },
    },
  }
);

db.Sequelize = Sequelize;
db.sequelize = sequelize;
sequelize.sync();

module.exports = db;
