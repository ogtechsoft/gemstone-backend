const express = require("express");
const router = express.Router();

const Certificate = require("../models/Certificate");
const Attach = require("../models/Attach");
const verifyJwt = require("../middleware/verfiyJwt");
const pdfGen = require("../utils/pdf");
const { storingFiles, isfileExist } = require("./attach");

Certificate.hasOne(Attach, { foreignKey: "foreignId" });

// get all certificates
router.get("/certificates", (req, res) => {
  let filter = req.query.filter;

  filter === undefined
    ? (filter = "")
    : (filter = JSON.parse(req.query.filter));

  Certificate.findAndCountAll({
    where: filter.where,
    include: {
      model: Attach,
      where: { class: "Certificate" },
      required: false,
    },
  })
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

// get single certificate
router.get("/certificates/:id", async (req, res) => {
  let certificateById = await getCertificate(req.params.id);

  if (certificateById) {
    return res.json({ message: certificateById, status: true });
  } else if (certificateById === false) {
    return res
      .status(404)
      .json({ message: "Certificate not found", status: false });
  } else {
    return res
      .status(422)
      .json({ message: "Something Went wrong", status: false });
  }
});

// check certificate
router.get("/certificates/lookup/:reportNumber", async (req, res) => {
  let certificateById = await getCertificate("", req.params.reportNumber);

  if (certificateById) {
    return res.json(certificateById);
  } else if (certificateById === false) {
    return res.status(404).json({ message: "Certificate not found" });
  } else {
    return res.status(422).json({ message: "Something Went wrong" });
  }
});

// create certificates
router.post("/certificates", async (req, res) => {
  let newCertificate = await createCertificate(req.body);
  // console.log(newCertificate.dataValues.id, "newCertificatenewCertificate");
  //let pdf = await pdfGen(req.body,newCertificate.dataValues.id)
  //Certificate.update({pdf:pdf}, {
  //where: { id: newCertificate.dataValues.id },
  //})
  if (req.body.image || req.body.image_data !== undefined) {
    let imageName = req.body.image;
    // console.log({ imageName });

    if (isfileExist(imageName)) {
      let imageStored = await storingFiles(
        "Certificate",
        newCertificate.id,
        imageName
      );
      if (!imageStored) {
        res
          .status(422)
          .json({ message: "something went wrong", status: false });
      }
    } else {
      res.status(404).json({ message: "File not found", status: false });
    }
  }

  if (newCertificate) {
    let certificateById = await getCertificate(newCertificate.id);
    //let certificateById = await getCertificate(newCertificate.id);
    let pdf = await pdfGen(req.body, newCertificate.dataValues.id);
    Certificate.update(
      { pdf: pdf },
      {
        where: { id: newCertificate.dataValues.id },
      }
    );
    if (certificateById) {
      return res.json({ message: certificateById });
    } else {
      return res.status(422).json({ message: "Something Went wrong" });
    }
  } else {
    return res.status(422).json({ message: "Something Went wrong" });
  }
});

// update certificates
router.put("/certificates/:id", async (req, res) => {
  if (req.body.image || req.body.image_data !== undefined) {
    let imageName = req.body.image;
    console.log({ imageName });
    if (isfileExist(imageName)) {
      let imageStored = await storingFiles(
        "Certificate",
        req.params.id,
        imageName
      );
      if (!imageStored) {
        res
          .status(422)
          .json({ message: "something went wrong", status: false });
      }
    } else {
      res.status(404).json({ message: "File not found", status: false });
    }
  }
  // console.log(req.body, "req.bodyreq.body");
  Certificate.update(req.body, {
    where: { id: req.params.id },
  })
    .then(async (result) => {
      let getCertificateData = await getCertificate(req.params.id);
      // console.log(getCertificateData.attachment.fileName, "getCertificateData");
      if (getCertificateData) {
        let pdf = await pdfGen(
          req.body,
          req.params.id,
          getCertificateData.attachment.fileName
        );
        Certificate.update(
          { pdf: pdf },
          {
            where: { id: req.params.id },
          }
        );
        res.json({ message: getCertificateData, status: true });
      } else if (getCertificateData === false) {
        res
          .status(404)
          .json({ message: "Certificate not found", status: false });
      } else {
        res
          .status(422)
          .json({ message: "Something Went wrong", status: false });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// delete certificates
router.delete("/certificates/:id", async (req, res) => {
  let id = req.params.id;

  let certificateById = await getCertificate(id);

  if (certificateById) {
    if (deleteCertificate(id)) {
      res.json({ message: "Certificate was deleted", status: true });
    } else {
      res.status(422).json({ message: "Something Went wrong", status: false });
    }
  } else {
    res.status(404).json({ message: "Certificate not found", status: false });
  }
});

let getCertificate = async (id, reportNumber) => {
  let obj;
  if (id) {
    obj = { id };
  } else if (reportNumber) {
    obj = { reportNumber };
  }
  return await Certificate.findOne({
    where: obj,
    include: {
      model: Attach,
      where: { class: "Certificate" },
      required: false,
    },
  })
    .then((certificate) => {
      if (certificate) {
        return certificate;
      } else {
        return false;
      }
    })
    .catch((err) => {
      return false;
    });
};

let createCertificate = async (newData) => {
  return await Certificate.create(newData)
    .then((result) => {
      if (result) {
        return result;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

let deleteCertificate = async (id) => {
  return await Certificate.destroy({
    where: { id },
    individualHooks: true,
  })
    .then((result) => {
      return true;
    })
    .catch((err) => {
      return false;
    });
};

module.exports = router;
