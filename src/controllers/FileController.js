const Box = require("../models/Box");
const File = require("../models/File");

module.exports = {
  async store(req, res) {
    const box = await Box.findById(req.params.id);

    const file = await File.create({
      title: req.file.originalname,
      path: req.file.key,
      size: req.file.size,
      url: req.file.location || ""
    });

    box.files.push(file);

    await box.save();

    req.io.sockets.in(box._id).emit("file", {
      socketId: req.headers.socketid,
      file
    });

    return res.json(file);
  },

  async delete(req, res) {
    const box = await Box.findById(req.params.id);
    const file = await File.findById(req.params.fileId);

    await file.remove();

    box.files.pull(file);
    await box.save();

    req.io.sockets.in(box._id).emit("deleteFile", {
      socketId: req.headers.socketid,
      file
    });

    return res.send();
  }
};
