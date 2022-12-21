const Sequelize = require("sequelize");
const db = require("../database/connection");

module.exports = db.sequelize.define(
  "attachments",
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    class: {
      type: Sequelize.STRING,
    },
    foreignId: {
      type: Sequelize.BIGINT,
      references: {
        model: 'certificates',
        key: 'id',
      },
    },
    fileName: {
      type: Sequelize.STRING,
    },
    dir: {
      type: Sequelize.STRING,
    },
    fileSize: {
      type: Sequelize.INTEGER,
    },
  },
  {
    timestamps: 1,
  }
);
