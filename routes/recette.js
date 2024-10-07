var express = require('express');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const Recette = require('../models/recette');
const User = require('../models/user');

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
      categorie,
      image,
    } = req.body;
    const newRecette = new Recette({
      tempsPreparation,
      tempsCuisson,
      titre,
      ingredients,
      preparation,
      nombrePersonnes,
      categorie,
      image,
    });
    await newRecette.save();
    res.status(201).json({
      result: true,
      message: 'Recette created successfully',
      data: newRecette,
    });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//---------------------UPDATE NOTES-----------------------------------------
router.put('/notes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { notes } = req.body;
    const updatedRecette = await Recette.findByIdAndUpdate(
      id,
      { $set: { notes } },
      { new: true },
    );
    res
      .status(200)
      .json({ result: true, message: 'Notes updated successfully' });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
//*---------------------DELETE CLOUDINARY-------------
router.delete('/cloudinary/delete/:url', async (req, res) => {
  try {
    const encodedUrlCloudinary = req.params.url;
    const urlCloudinary = decodeURIComponent(encodedUrlCloudinary);
    // Extract publicId in URL to suppress in Cloudinary
    let url = urlCloudinary.split('/');
    let publicId = url[url.length - 1].split('.')[0]; // no extension. we keep it only for raw

    // Suppress from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.json({ result: true, message: 'image destroyed' }); // 1 artwork removed
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting artwork', error });
  }
});
//* -----------------DELETE USER RECIEPE-----------------
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Suppress from recettes
    const deletedRecette = await Recette.findByIdAndDelete(id);

    if (!deletedRecette) {
      return res
        .status(404)
        .json({ result: false, message: 'Recette not found' });
    }

    // Suppress from user
    await User.updateMany({ recettes: id }, { $pull: { recettes: id } });

    res.json({ result: true, message: 'Recette deleted successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ result: false, message: 'Error deleting recette', error });
  }
});
//!---------------------DELETE ALL--------------------
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
