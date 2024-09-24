var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Recette = require('../models/recette');
const { checkBody } = require('../modules/checkBody');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
//* ////////////////////////////////create user////////////////////////////////////////////
router.post('/signup', async (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  try {
    // Check if the email is already registered
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.json({ result: false, error: 'Email already exists' });
    }

    // Check if the username is already registered
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${req.body.username}$`, 'i') },
    });
    if (existingUsername) {
      return res.json({ result: false, error: 'Username already exists' });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hash,
      token: uid2(32),
      email: req.body.email,
    });

    await newUser.save();
    console.log('##Welcome ', req.body.username);
    userInfo = {
      username: newUser.username,
      token: newUser.token,
      email: newUser.email,
    };
    res.json({ result: true, userInfo });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ result: false, error: 'Internal server error' });
  }
});
// * ////////////////////////////////signin///////////////////////////////////////////
router.post('/signin', (req, res) => {
  console.log('---------------------signin---------------------');
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({
    username: { $regex: new RegExp(`^${req.body.username}$`, 'i') },
  })
    // .populate(["favorites", "following"])
    .then((userInfo) => {
      if (
        userInfo &&
        bcrypt.compareSync(req.body.password, userInfo.password)
      ) {
        console.log('##', req.body.username, ' just signed In', userInfo);
        userInfo = {
          username: userInfo.username,
          token: userInfo.token,
        };
        res.json({ result: true, userInfo });
      } else {
        res.json({ result: false, error: 'wrong username or password' });
      }
    });
});
//* //////////////////////////////////ajout de recettes//////////////////////////////////////
router.post('/recette', async (req, res) => {
  try {
    const nouvelleRecette = new Recette(req.body);
    const recetteSauvegardee = await nouvelleRecette.save();
    res.status(201).json(recetteSauvegardee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

///////////ajout d'images dans le compte du user
router.put('/user', async (req, res) => {
  try {
    console.log('-------->', req.body);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const newPicture = {
        name: req.body.name,
        url: req.body.url,
      };
      user.pictures.push(newPicture);
      await user.save();
      return res.json({ result: true, data: user });
    } else {
      return res.json({ result: false, error: 'User not found' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ result: false, error: 'Internal server error' });
  }
});

////////////post des images sur cloudinary
router.post('/upload', async (req, res) => {
  console.log('----------------------upload------------------------');
  try {
    if (!req.files || !req.files.photoFromFront) {
      return res.status(400).json({ result: false, error: 'No file uploaded' });
    }

    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);
    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      if (resultCloudinary) {
        fs.unlinkSync(photoPath);
      }
      return res.json({ result: true, url: resultCloudinary.secure_url });
    } else {
      return res.json({ result: false, error: resultMove });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return res
      .status(500)
      .json({ result: false, error: 'Internal server error' });
  }
});
//* ///////////////////////////////get user pictures////////////////////////////////////////////////
router.get('/pictures/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      return res.json({ result: true, data: user.pictures });
    } else {
      return res.json({ result: false, error: 'User not found' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ result: false, error: 'Internal server error' });
  }
});
//* /////////////////delete a picture/////////////////////////////////////////////////////////////////
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body.email;
    if (!email) {
      return res
        .status(400)
        .json({ result: false, error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ result: false, error: 'User not found' });
    }
    const picturesLengthBefore = user.pictures.length;
    // Filter user.pictures to remove the picture with the given _id
    const picturesLengthAfter = updatedPictures.length;
    console.log(picturesLengthAfter, picturesLengthBefore);
    if (picturesLengthBefore === picturesLengthAfter + 1) {
      // Update the user's pictures array
      user.pictures = updatedPictures;
      // Save the updated user
      await user.save();
      return res.json({ result: true, message: 'Picture deleted' });
    }
    return res.json({ result: false, error: 'Picture not deleted' });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ result: false, error: 'Internal server error' });
  }
});

module.exports = router;
