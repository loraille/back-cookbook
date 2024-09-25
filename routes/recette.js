var express = require('express');
var router = express.Router();
const Recette = require('../models/recette');

//* ----------------------------add a new reciepe
router.post('/', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const {
      tempsPreparation,
      tempsCuisson,
      titre,
      ingredients,
      preparation,
      nombrePersonnes,
    } = req.body;
    const newRecette = new Recette({
      tempsPreparation,
      tempsCuisson,
      titre,
      ingredients,
      preparation,
      nombrePersonnes,
    });
    await newRecette.save();
    res
      .status(201)
      .json({ result: true, message: 'Recette created successfully' });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//---------------------DELETE ALL--------------------
router.delete('/', async (req, res) => {
  try {
    await Recette.deleteMany({});
    res
      .status(200)
      .json({ result: true, message: 'All recettes deleted successfully' });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
