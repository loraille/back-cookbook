var express = require('express');
var router = express.Router();
const Category = require('../models/categorie');

//* -----------add a category-----------
router.post('/', async (req, res) => {
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

module.exports = router;
