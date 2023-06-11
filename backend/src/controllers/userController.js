require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const Blogs = require("../models/blogModel");
const Comments = require("../models/commentModel");
// helper functions
const createToken = (_id) =>
  jwt.sign({ _id }, process.env.SECRET, { expiresIn: "30d" });

// async function getBlogsAndComments(user) {
//   const blogs = await Blogs.find({ userId: user._id });
//   const comments = await Comments.find({ author: user.username });
//   return { ...user.toObject(), blogs, comments };
// }

// controllers
const signup = async function (req, res) {
  const { email, password, username } = req.body;
  try {
    const user = await User.signup(username, email, password);
    const token = createToken(user._id);
    res.status(200).json({ username, email, _id: user._id, token });
    console.log("Success signup");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res
      .status(200)
      .json({ username: user.username, email, _id: user._id, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password -updatedAt")
      .populate("blogs")
      .populate("comments");
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      "-password -updatedAt",
    )
      .populate("blogs")
      .populate("comments")
      .populate("spaces", "title _id");
    console.log(user);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password -updatedAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//checked
const followUser = async (req, res) => {
  let currentUser = req.user;
  console.log(currentUser.following);

  if (currentUser.username === req.params.username) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    let userToFollow = await User.findOne({ username: req.params.username });
    console.log(userToFollow);
    if (!userToFollow) return res.status(404).json({ error: "User not found" });
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ error: "You already follow this user" });
    }

    userToFollow = await User.findOneAndUpdate(
      { username: userToFollow.username },
      { $addToSet: { followers: currentUser._id } },
      { new: true }, // return the updated user
    );

    currentUser = await User.findOneAndUpdate(
      { username: currentUser.username },
      { $addToSet: { following: userToFollow._id } },
      { new: true },
    );

    res.status(200).json({ currentUser, userToFollow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  let currentUser = req.user;
  console.log(currentUser.following);
  try {
    let userToUnfollow = await User.findOne({
      username: req.params.username,
    });
    if (!userToUnfollow)
      return res.status(404).json({ error: "User not found" });
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ error: "You don't follow this user" });
    }

    currentUser = await User.findOneAndUpdate(
      { username: currentUser.username },
      { $pull: { following: userToUnfollow._id } },
      { new: true },
    );

    userToUnfollow = await User.findOneAndUpdate(
      { username: userToUnfollow.username },
      { $pull: { followers: currentUser._id } },
      { new: true },
    );

    console.log(currentUser.following);
    res.status(200).json({ currentUser, userToUnfollow });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserById,
  signup,
  login,
  getUsers,
  getUserByUsername,
  followUser,
  unfollowUser,
};