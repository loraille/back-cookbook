const mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
const List = require('../models/list');


//* -----------get lists----------
router.get('/all/:id', async (req, res) => {
  try {
    const id=req.params.id
    let list = await List.find({user:id}).select('_id name');

    if (list) {
      res.json({ result: true, list });
    } else {
      res.status(404).json({ result: false, message: 'Aucune liste trouvée.' });
    }
  } catch (error) {
    console.error('Problème pour récupérer les informations de la liste :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
//* -----------get list infos----------
console.log('----------------------------infos')
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const list = await List.findOne({ _id: id });
    if (list) {
      res.json({ result: true, list });
    } else {
      res.status(404).json({ result: false, error: 'List not found' });
    }
  } catch (error) {
    console.error('Problem to get list infos:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//* -----------add a list-----------
router.post('/add/:userId', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.params.userId;

    // Vérifier si la liste existe déjà pour cet utilisateur
    const existingList = await List.findOne({ name: name, user: userId });

    if (existingList) {
      // Si la liste existe déjà, retourner une erreur appropriée
      return res.status(400).json({ result: false, error: 'Cette liste existe déjà pour cet utilisateur.' });
    }

    // Créer une nouvelle liste si elle n'existe pas
    const newList = new List({
      name: name,
      user: userId
    });

    await newList.save();
    res.json({ result: true });
  } catch (error) {
    console.error('Problème lors de l\'ajout d\'une liste:', error);
    res.status(500).json({ result: false, error: 'Erreur interne du serveur' });
  }
});
//add item
// POST /list/item/add/:listId
router.post('/add/item/:listId', async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    const { item, value } = req.body;
    const list = await List.findById(req.params.listId);

    if (!list) return res.status(404).json({ result: false });

    list.items.push({
      _id: new mongoose.Types.ObjectId(),
      item: item.trim(),
      value: value || '',
    });

    await list.save();
    res.json({ result: true, list });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'item :", error);
    res.status(500).json({ result: false });
  }
});

//* ////////////////////////////////update list items///////////////////////////////////////////
// Mettre à jour ou ajouter un item dans une liste
router.put('/:id', async (req, res) => {
  try {
    const listId = req.params.id; // ID de la liste
    const { items } = req.body; // Nouveaux éléments ou modifications

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ result: false, error: 'Invalid items data' });
    }

    // Rechercher la liste par son ID
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ result: false, error: 'List not found' });
    }

    // Créer un tableau pour stocker les éléments mis à jour ou ajoutés
    const updatedItems = [...list.items]; // Copie des éléments existants

    // Parcourir les nouveaux éléments à mettre à jour/ajouter
    for (const newItem of items) {
      const existingItemIndex = updatedItems.findIndex((item) => item.item === newItem.item);

      if (existingItemIndex !== -1) {
        // Si l'élément existe déjà, mettez à jour sa valeur
        updatedItems[existingItemIndex].value = newItem.value;
      } else {
        // Sinon, créez un nouvel élément avec un _id généré automatiquement
        const newItemWithId = { ...newItem, _id: new mongoose.Types.ObjectId() };
        updatedItems.push(newItemWithId);
      }
    }

    // Remplacer les éléments existants par les éléments mis à jour/ajoutés
    list.items = updatedItems;

    // Sauvegarder la liste mise à jour
    await list.save();

    res.json({ result: true, list });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//* ////////////////////////////////update list name///////////////////////////////////////////
router.put('/name/:listId', async (req, res) => {
  try {
    const listId = req.params.listId; 
    const name = req.body.name;

    // Récupération de la liste existante
    const updatedList = await List.findOne({ _id: listId });
    if (!updatedList) {
      return res.status(404).json({ result: false, error: 'Liste non trouvée.' });
    }

    //modification du nom
    updatedList.name = name;
  
    // Sauvegarde de la liste mise à jour
    await updatedList.save();

    // Réponse réussie
    res.json({ result: true, message: 'Nom de la liste mise à jour avec succès.', data: updatedList });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
router.put('/item/update/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const updates = req.body; // Contient "item" et/ou "value"

    const list = await List.findOne({ "items._id": itemId });
    if (!list) {
      return res.status(404).json({ result: false, error: 'Item not found' });
    }

    list.items = list.items.map((i) =>
      i._id.toString() === itemId ? { ...i, ...updates } : i
    );

    await list.save();
    res.json({ result: true, list });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'item :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
//* ----------delete lists----------
router.delete('/:id', async (req, res) => {
  try {
    const id=req.params.id
    let list = await List.findByIdAndDelete(id);

    if (list) {
      res.json({ result: true, message:'Liste supprimée' });
    } else {
      res.status(404).json({ result: false, message: 'Aucune liste trouvée.' });
    }
  } catch (error) {
    console.error('Problème pour récupérer les informations de la liste :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
// Supprimer un item spécifique dans une liste
router.delete('/item/delete/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const list = await List.findOne({ "items._id": itemId });
    if (!list) {
      return res.status(404).json({ result: false, error: 'Item not found' });
    }

    list.items = list.items.filter((i) => i._id.toString() !== itemId);
    await list.save();

    res.json({ result: true, list });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'item :', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
