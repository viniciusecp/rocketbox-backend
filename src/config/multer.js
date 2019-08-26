const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp"));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err); // caso de errad de não conseguir gera a hash, chama a função de cb e passa o erro

        file.key = `${hash.toString("hex")}-${file.originalname}`; // ç12k4l12k3-teste.jpg

        cb(null, file.key);
      });
    }
  }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // sem isso, qnd abre o link do arquivo, faz o download direto, isso faz qnd for uma imagem, por exemplo, fazer ela abrir no browser
    acl: "public-read", //por default, ng pode fazer nada com os arquivos que vão pro s3
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err); // caso de errad de não conseguir gera a hash, chama a função de cb e passa o erro

        file.key = `${hash.toString("hex")}-${file.originalname}`; // ç12k4l12k3-teste.jpg

        cb(null, file.key);
      });
    }
  })
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp"), // é igual a ../../tmp/
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif"
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
};
