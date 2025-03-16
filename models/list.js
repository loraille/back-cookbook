const mongoose = require('mongoose');

const listSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId }, // Identifiant unique pour chaque item
        item: { type: String, required: true },
        value: { type: String, required: true } // Ou utilisez mongoose.Schema.Types.Mixed si besoin
      },
    ],
  },
  {
    timestamps: true,
  },
);

const List = mongoose.model('lists', listSchema);
module.exports = List;