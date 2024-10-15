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
//*---------------------GET RECIEPE BY ID--------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const recette = await Recette.findById(id);

    if (!recette) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json(recette);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//*---------------------UPDATE RECIEPE-----------------------------------------
router.put('/recetteInfo/:id', async (req, res) => {
  console.log('update recipe');
  console.log('Received data:', req.body);
  try {
    const id = req.params.id;
    const {
      titre,
      nombrePersonnes,
      tempsPreparation,
      tempsCuisson,
      ingredients,
      preparation,
      image,
      notes,
      categorie,
    } = req.body;

    const recette = await Recette.findById(id);

    if (!recette) {
      console.log('Recette not found with ID:', id);
      return res
        .status(404)
        .json({ result: false, message: 'Recette not found' });
    }

    if (titre !== undefined && titre !== recette.titre) recette.titre = titre;
    if (
      nombrePersonnes !== undefined &&
      nombrePersonnes !== recette.nombrePersonnes
    )
      recette.nombrePersonnes = nombrePersonnes;
    if (
      tempsPreparation !== undefined &&
      tempsPreparation !== recette.tempsPreparation
    )
      recette.tempsPreparation = tempsPreparation;
    if (tempsCuisson !== undefined && tempsCuisson !== recette.tempsCuisson)
      recette.tempsCuisson = tempsCuisson;
    if (
      ingredients !== undefined &&
      JSON.stringify(ingredients) !== JSON.stringify(recette.ingredients)
    )
      recette.ingredients = ingredients;
    if (
      preparation !== undefined &&
      JSON.stringify(preparation) !== JSON.stringify(recette.preparation)
    )
      recette.preparation = preparation;
    if (image !== undefined && image !== recette.image) recette.image = image;
    if (notes !== undefined && notes !== recette.notes) recette.notes = notes;
    if (categorie !== undefined && categorie !== recette.categorie)
      recette.categorie = categorie;

    await recette.save();

    res
      .status(200)
      .json({ result: true, message: 'Recette updated successfully', recette });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
//---------------------UPDATE NOTES-----------------------------------------
router.put('/notes/:id', async (req, res) => {
  console.log('update notes');
  try {
    const id = req.params.id;
    const { notes } = req.body;

    console.log('ID:', id);
    console.log('Notes:', notes);

    const recette = await Recette.findById(id);

    if (!recette) {
      console.log('Recette not found with ID:', id);
      return res
        .status(404)
        .json({ result: false, message: 'Recette non trouvée' });
    }

    recette.notes = notes;

    await recette.save();

    res
      .status(200)
      .json({ result: true, message: 'Notes updated successfully' });
  } catch (error) {
    console.error('Error with server:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
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

    const usersWithRecette = await User.find({ recettes: id });

    if (usersWithRecette.length > 0) {
      await User.updateMany({ recettes: id }, { $pull: { recettes: id } });
    }

    res.json({ result: true, message: 'Recette deleted successfully' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ result: false, message: 'Error deleting recette', error });
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

//!---------------------DELETE ALL--------------------
// router.delete('/', async (req, res) => {
//   try {
//     await Recette.deleteMany({});
//     res
//       .status(200)
//       .json({ result: true, message: 'All recettes deleted successfully' });
//   } catch (error) {
//     console.error('Error with server:', error);
//     res.status(500).json({ result: false, error: 'Internal server error' });
//   }
// });

module.exports = router;
