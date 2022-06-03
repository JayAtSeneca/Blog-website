const fs = require("fs");
var posts = [];
var categories = [];

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    try {
      fs.readFile("./data/posts.json", "utf8", function (err, data) {
        if (err) throw err;
        posts = JSON.parse(data);
        console.log("Posts loaded");
      });
      fs.readFile("./data/categories.json", "utf8", function (err, data) {
        if (err) throw err;
        categories = JSON.parse(data);
        console.log("Categories loaded");
      });
      resolve("files loaded");
    } catch (err) {
      reject("unable to read file");
    }
  });
};

module.exports.getAllPosts = () => {
  return new promise((resolve, reject) => {
    if (posts.length() == 0) {
      reject("no results returned");
    } else {
      resolve(posts);
    }
  });
};

module.exports.getPublishedPosts = () => {
  var publishedPosts = [];
  return new Promise((resolve, reject) => {
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].published == true) {
        publishedPosts.push(posts[i]);
      }
    }

    if (publishedPosts.length == 0) {
      var err = "no results returned";
      reject({ message: err });
    }

    resolve(publishedPosts);
  });
};

module.exports.getCategories = () => {
  return new promise((resolve, reject) => {
    if (categories.length == 0) {
      reject("no results returned");
    } else {
      resolve(categories);
    }
  });
};
