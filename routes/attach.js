const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const randomstring = require("randomstring");
const _ = require("lodash");

const Attach = require("../models/Attach");

const upload = multer({
  dest: path.join(__dirname, "../temp/"),
  limits: { fileSize: 1024 * 1024 * 2 },
});

let allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
const isAllowedExt = (ext) => allowedExt.indexOf(ext) > -1;

let tempFileStore = (req, res) => {
  if (req.file == null) {
    return res
      .status(400)
      .json({ message: "Please upload the file", status: false });
  }
  const tempPath = req.file.path;

  let tempName = randomstring.generate(10);
  let orgFileExt = path.extname(req.file.originalname).toLowerCase();
  const targetPath = path.join(__dirname, "../temp/" + tempName + orgFileExt);
	  console.log(tempPath, targetPath,"tempPath, targetPath");

  if (isAllowedExt(orgFileExt)) {
    fs.rename(tempPath, targetPath, (err) => {
	console.log(err,"ERRRRR....")
      res.status(200).json({
        data: {
          fileName: tempName + orgFileExt,
        },
        status: true,
      });
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return res.status(422).json({ message: err, status: false });

      res
        .status(400)
        .json(
          res.json({ message: "This type of files are allowed!", status: false })
        );
    });
  }
};

let storingFiles = async (className, id, fileName, isMulitiple) => {
  let oldPath = `temp/${fileName}`;
  let newPath = `media/${className}/${id}`;
  return new Promise((resolve) => {
    fs.mkdir(newPath, { recursive: true }, async (err) => {
      if (err) {
        resolve(false);
      }
      let isAlreadyHaveAttach = await getAttachmentDetails(id, className);
      if (isAlreadyHaveAttach && className === "UserAvatar") {
        deleteAllFiles(newPath);
      }
      fs.copyFile(oldPath, `${newPath}/${fileName}`, (err) => {
        if (err) {
          console.log("in copy", err);
          if (err.errno === -4058) resolve("File Not Found");
        } else {
          let stats = fs.statSync(oldPath);
          if (_.isEmpty(isAlreadyHaveAttach) || isMulitiple) {
            console.log("create attach");
            Attach.create({
              class: className,
              foreignId: id,
              dir: newPath,
              fileName: fileName,
              fileSize: stats.size,
            })
              .then((result) => {
                console.log({ result });
                resolve(true);
                deleteFiles(oldPath);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            Attach.update(
              {
                dir: newPath,
                fileName: fileName,
                fileSize: stats.size,
              },
              {
                where: {
                  [Op.and]: [{ foreignId: id }, { class: className }],
                },
              }
            )
              .then((result) => {
                resolve(true);
                deleteFiles(oldPath);
              })
              .catch((err) => console.log(err));
          }
        }
      });
    });
  });
};

// found file exists or not
let isfileExist = (fileName) => {
  try {
    if (fs.existsSync(`temp/${fileName}`)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
  }
};

//get attachement details
let getAttachmentDetails = async (id, className) => {
  return await Attach.findAll({
    where: {
      [Op.and]: [{ foreignId: id }, { class: className }],
    },
  })
    .then((result) => {
      if (result != null) {
        return result;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// delete the temp file
let deleteFiles = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
      return false;
    } else {
      return true;
    }
  });
};

//delete all files
let deleteAllFiles = (filePath) => {
  fs.readdir(filePath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(filePath, file), (err) => {
        if (err) throw err;
      });
    }
  });
};

router.post("/attachment", upload.single("file"), tempFileStore);

module.exports = {
  getAttachmentDetails,
  isfileExist,
  storingFiles,
  deleteFiles,
};

module.exports.router = router;
