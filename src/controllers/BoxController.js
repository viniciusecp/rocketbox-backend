const Box = require("../models/Box");

module.exports = {
  async store(req, res) {
    const { title } = req.body;

    const boxExists = await Box.findOne({ title });

    if (boxExists) {
      return res.json(boxExists);
    }

    const box = await Box.create({ title });

    return res.send(box);
  },

  async show(req, res) {
    const box = await Box.findById(req.params.id).populate({
      path: "files",
      options: { sort: { createdAt: -1 } } // ordenar decrescente
    });

    return res.json(box);
  }
};
