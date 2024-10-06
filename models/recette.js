const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    ingredient: String,
    quantite: String,
    unite: String,
  },
  { _id: false },
);

const prepSchema = new mongoose.Schema(
  {
    consigne: String,
    index: String,
  },
  { _id: false },
);

const recetteSchema = mongoose.Schema(
  {
    titre: String,
    nombrePersonnes: String,
    tempsPreparation: String,
    tempsCuisson: String,
    ingredients: [ingredientSchema],
    preparation: [prepSchema],
    image: String,
    notes: String,
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  },
  {
    timestamps: true,
  },
);

const Recette = mongoose.model('recettes', recetteSchema);

module.exports = Recette;
