const mongoose = require('mongoose');

const categorieSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    color: String,
  },
  {
    timestamps: true,
  },
);

const Categorie = mongoose.model('categories', categorieSchema);

module.exports = Categorie;
