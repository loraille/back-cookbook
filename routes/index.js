var express = require('express');
var router = express.Router();
const User = require("../models/user");
const { checkBody } = require("../modules/checkBody");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const { userInfo } = require("os");

//* ////////////////////////////////create user////////////////////////////////////////////
router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    // Check if the email is already registered
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.json({ result: false, error: "Email already exists" });
    }

    // Check if the username is already registered
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${req.body.username}$`, "i") },
    });
    if (existingUsername) {
      return res.json({ result: false, error: "Username already exists" });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hash,
      token: uid2(32),
      email: req.body.email,
      settings: [],
    });

    await newUser.save();
    console.log("##Welcome ", req.body.username);
    const userInfo = {
      id: newUser._id,
      username: newUser.username,
      token: newUser.token,
      email: newUser.email,
    };
    res.json({ result: true, userInfo });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});
// * ////////////////////////////////signin///////////////////////////////////////////
router.post("/signin", (req, res) => {
  console.log("---------------------signin---------------------");
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({
    username: { $regex: new RegExp(`^${req.body.username}$`, "i") },
  }).then((userInfo) => {
    if (userInfo && bcrypt.compareSync(req.body.password, userInfo.password)) {
      console.log("##", req.body.username, " just signed In", userInfo);
      userInfo = {
        username: userInfo.username,
        id: userInfo.id,
        token: userInfo.token,
      };
      res.json({ result: true, userInfo });
    } else {
      res.json({ result: false, error: "wrong username or password" });
    }
  });
});
//* ////////////////////////////////update settings///////////////////////////////////////////
router.put("/update/:newSettings", async (req, res) => {
  try {
    const { username, token } = req.body;
    const newSettings = req.params.newSettings;
    console.log(newSettings);

    if (!username || !token) {
      return res.json({
        result: false,
        error: "Missing username, token",
      });
    }

    // Find the user by username and token
    const user = await User.findOne({ username, token });

    if (!user) {
      return res.json({
        result: false,
        error: "User not found or invalid token",
      });
    }

    // Reset the settings array
    user.settings = [];

    // Add the new setting to the settings array
    for (let setting of newSettings) {
      user.settings.push(setting);
    }
    await user.save();

    res.json({
      result: true,
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});




module.exports = router;
