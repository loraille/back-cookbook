var express = require('express');
var router = express.Router();
const Category = require('../models/categorie');

//* -----------get category infos----------
router.get('/', async (req, res) => {
  try {
    const categoryInfo = await Category.find({});
    if (categoryInfo) {
      res.json({ result: true, categoryInfo });
    }
  } catch (error) {
    console.error('problem to get category infos:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//* -----------add a category-----------
router.post('/add', async (req, res) => {
  try {
    const name = req.body.name;
    const newCategory = new Category({
      name: name,
    });
    await newCategory.save();
    res.json({ result: true });
  } catch (error) {
    console.error('problem to add a category:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//* -----------get category infos----------
router.get('/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const categoryInfo = await Category.findOne({ name: category });
    if (categoryInfo) {
      res.json({ result: true, categoryInfo });
    }
  } catch (error) {
    console.error('problem to get category infos:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

//* -----------get category infos by id----------
router.get('/id/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const categoryInfo = await Category.findOne({ _id: id });
    if (categoryInfo) {
      res.json({ result: true, categoryInfo });
    }
  } catch (error) {
    console.error('problem to get category infos:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
