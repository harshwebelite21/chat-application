const { render } = require("../routes/userRoute");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const bcrypt = require("bcrypt");

const registerLoad = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: "images/" + req.body.image,
      password: passwordHash,
    });

    await user.save();
    res.render("register", { message: "registration completed!" });
  } catch (error) {
    console.error(error.message);
  }
};
const register = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.error(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login", { message: "Please Login" });
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.redirect("dashboard");
      } else {
        res.render("login", { message: "Email and Password isError" });
      }
    } else {
      res.render("login", { message: "Email and Password isError" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashboard = async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin: [req.session.user._id] } });
    res.render("dashboard", { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};

const saveChat = async (req, res) => {
  try {
    const chat = new Chat({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message,
    });
    const newChat = await chat.save();
    res
      .status(200)
      .send({ success: true, msg: "Chat Inserted", data: newChat });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// To Delete User Chat
const deleteChat = async (req, res) => {
  try {
    console.log(req.body.id);
    await Chat.findByIdAndDelete(req.body.id);
    console.log(req.body.id);

    res.send({ success: true, msg: "Chat Deleted" });
  } catch (error) {
    console.log("kem 6o majama");
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  register,
  registerLoad,
  loadDashboard,
  loadLogin,
  login,
  saveChat,
  logout,
  deleteChat,
};
