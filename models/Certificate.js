const Sequelize = require("sequelize");
const db = require("../database/connection");

module.exports = db.sequelize.define(
  "certificate",
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    productCategory: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    reportNumber: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    reportDate: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    species: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    variety: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    shapeCut: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    transparencyColor: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    dimension: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    caratWeight: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    RI: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    SG: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    hardness: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    comments: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    pdf: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    other: {
      type: Sequelize.JSON,
      defaultValue: null,
    },
    type: {
      type: Sequelize.NUMBER,
      defaultValue: 0,
    },
  },
  {
    timestamps: 1,
  }
);
