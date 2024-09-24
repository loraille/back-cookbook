const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    nom: String,
    quantite: String,
    unite: String,
  },
  { _id: false },
);

const recetteSchema = mongoose.Schema(
  {
    titre: String,
    nombrePersonnes: Number,
    tempsPreparation: Number,
    tempsCuisson: Number,
    ingredients: [ingredientSchema],
    instructions: [{ String }],
    image: String,
    publishDate: Date,
    notes: String,
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
  },
  {
    timestamps: true,
  },
);

const Recette = mongoose.model('Recette', recetteSchema);

module.exports = Recette;
