const express = require("express");
const user_route = express();
const bodyParser = require("body-parser");
const path = require("path");
user_route.use(bodyParser.json());
const multer = require("multer");
const session = require("express-session");
const { SECRET } = process.env;
const auth = require("../middlewares/auth");

user_route.use(bodyParser.urlencoded({ extended: true }));
const userController = require("../controllers/userController");

user_route.set("view engine", "ejs");
user_route.set("views", "./views");
user_route.use(session({ secret: SECRET }));

user_route.use(express.static("public"));

user_route.post("/register", auth.isLogout, userController.registerLoad);
user_route.get("/register", userController.register);

user_route.get("/", auth.isLogout, userController.loadLogin);
user_route.post("/", userController.login);

user_route.get("/logout", auth.isLogin, userController.logout);

user_route.get("/dashboard", auth.isLogin, userController.loadDashboard);

user_route.post("/save-chat", userController.saveChat);

user_route.get("*", async (req, res) => {
  res.redirect("/login");
});

module.exports = user_route;
