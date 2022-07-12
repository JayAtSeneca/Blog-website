const fs = require("fs");
var posts = [];
var categories = [];
var postByCategory = [];
var postByMinDate = [];
var postById = [];

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
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      var err = "no results returned";
      reject({ message: err });
    }

    resolve(posts);
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
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      var err = "no results returned";
      reject({ message: err });
    }

    resolve(categories);
  });
  return promise;
};

module.exports.addPost = (postData) => {
  return new Promise((resolve, reject) => {
    let yourDate = new Date();
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);

    postData.published = postData.published ? true : false;
    postData.id = posts.length + 1;
    postData.postDate = yourDate.toISOString().split("T")[0];

    posts.push(postData);

    if (posts.length == 0) {
      var err = "no results returned";
      reject({ message: err });
    }
    resolve(postData);
  });
};

module.exports.getPostByCategory = (category) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].category == category) postByCategory.push(posts[i]);
    }
    if (postByCategory.length === 0) {
      let err = "no results returned";
      reject({ message: err });
    }

    resolve(postByCategory);
  });
};

module.exports.getPostByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < posts.length; i++) {
      if (new Date(posts[i].postDate) >= new Date(minDateStr))
        postByMinDate.push(posts[i]);
    }
    if (postByMinDate.length === 0) {
      let err = "no results returned";
      reject({ message: err });
    }

    resolve(postByMinDate);
  });
};

module.exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
    if (posts.length != 0) {
      resolve(posts.filter((post) => post.id == Number(id)));
    } else {
      reject({ msg: "No Data" });
    }
  });
};

module.exports.getPublishedPostsByCategory = (category) => {
  let publishedPosts = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].category == category && posts[i].published == true)
        publishedPosts.push(posts[i]);
    }
    if (publishedPosts.length === 0) {
      let err = "no results returned";
      reject({ message: err });
    }

    resolve(publishedPosts);
  });
};
