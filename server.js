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
