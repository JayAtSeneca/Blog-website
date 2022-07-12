/*********************************************************************************
 * WEB322 – Assignment 04
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
 *
 * Name: Jay Pravinkumar Chaudhari
 * Student ID: 147268205
 * Date: 16/06/2022
 *
 * Online (Heroku) URL: https://pacific-hamlet-47186.herokuapp.com/blog
 *
 * GitHub Repository URL: https://github.com/JayAtSeneca/web322-app
 *
 ********************************************************************************/

var express = require("express");
var app = express();
var blogService = require("./blog-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const path = require("path");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: "dltn1ghdm",
  api_key: "884661395299724",
  api_secret: "8ZDycm8695UflqV_kEC0D26s-3k",
  secure: true,
});

// handlebars setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
    },
  })
);
app.set("view engine", ".hbs");
app.set("views", "./views");

const upload = multer();

function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}

app.use(express.static("public"));

// middleware
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    const post = await blogService.getPostById(req.params.id);
    viewData.post = post[0];
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)

  res.render("blog", { data: viewData });
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogService
      .getPostByCategory(req.query.category)
      .then((posts) => {
        console.log("getAllPosts by category displayed.");
        res.render("posts", { posts });
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    blogService
      .getPostByMinDate(req.query.minDate)
      .then((posts) => {
        console.log("getAllPosts by minDate displayed.");
        res.render("posts", { posts });
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.render("posts", { message: "no results" });
      });
  } else {
    blogService
      .getAllPosts()
      .then((posts) => {
        console.log("getAllPosts displayed.");
        res.render("posts", { posts });
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.render("posts", { message: "no results" });
      });
  }
});

app.get("/post/:id", (req, res) => {
  blogService
    .getPostById(req.params.id)
    .then((data) => {
      console.log("getPostById displayed.");
      res.json(data);
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
      res.json(err);
    });
});

app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((categories) => {
      console.log("getCategories displayed.");
      res.render("categories", { categories });
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
      res.render("categories", { message: "no results" });
    });
});

app.get("/posts/add", function (req, res) {
  res.render("addPost");
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;

    blogService
      .addPost(req.body)
      .then((data) => {
        res.redirect("/posts");
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
      });
  });
});

app.use((req, res) => {
  res.status(404).render("404");
});

console.log("Ready for initialize");
blogService
  .initialize()
  .then(() => {
    console.log("starting the server");
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log("ERROR MESSAGE:", err.message);
  });
