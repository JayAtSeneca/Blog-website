/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jay Pravinkumar Chaudhari Student ID: 147268205 Date: 2022-06-03
*
*  Online (Heroku) URL: https://lit-castle-17301.herokuapp.com/
*
*  GitHub Repository URL: https://github.com/JayAtSeneca/web322-app
*
********************************************************************************/ 
var express = require("express");
var app = express();
var path = require("path");
const blogService = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.redirect("/about");
});

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});
app.get("/blog", function (req, res) {
  blogService
    .getPublishedPosts()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/posts", function (req, res) {
  blogService
    .getAllPosts()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/categories", function (req, res) {
  blogService
    .getCategories()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("Error: " + err);
  });
