var express = require("express");
require('dotenv').config()
var app = express();
var blogService = require("./blog-service");
var authData = require("./auth-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const path = require("path");
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const clientSessions = require("client-sessions");

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
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "assignment6_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

const upload = multer();

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
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

app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body).then((user) => {
      req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
      };
      res.redirect('/posts');
  }).catch((err) => {
      res.render('login', {errorMessage: err, userName: req.body.userName});
  });
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body).then(() => {
      res.render('register', {successMessage: "User created"});
  }).catch((err) => {
      res.render('register', {errorMessage: err, userName: req.body.userName});
  });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render('userHistory');
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

app.get("/posts", ensureLogin, (req, res) => {
  if (req.query.category) {
    blogService
      .getPostsByCategory(req.query.category)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch(() => {
        res.render("posts", { message: "no results" });
      });
  } else if (req.query.minDate) {
    blogService
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        if (data.length > 0) res.render("posts", { posts: data });
        else res.render("posts", { message: "no results" });
      })
      .catch(() => {
        res.render("posts", { message: "no results" });
      });
  }
});

app.get("/post/:id", ensureLogin, (req, res) => {
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

app.get("/categories", ensureLogin, (req, res) => {
  blogService
    .getCategories()
    .then((categories) => {
      if (categories.length > 0) {
        console.log("getCategories displayed.");
        res.render("categories", { categories });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
  blogService
    .addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(console.log("Unable to Add category"));
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  blogService
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(console.log("Unable to Remove Category / Category not found)"));
});

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blogService
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch((err) => {
      res.status(500).render("posts", {
        msg: "Unable to Remove Post / Post Not Found",
      });
    });
});

app.get("/posts/add", ensureLogin, function (req, res) {
  blogService
    .getCategories()
    .then((data) => {
      res.render("addPost", {
        categories: data,
      });
    })
    .catch(() => {
      res.render("addPost"), { categories: [] };
    });
});

app.post(
  "/posts/add",
  ensureLogin,
  upload.single("featureImage"),
  (req, res) => {
    if (req.file) {
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
        processPost(uploaded.url);
      });
    } else {
      processPost("https://dummyimage.com/847x320/d9d9d9/545454.jpg");
    }

    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;

      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
      console.log("server: ", req.body);
      blogService
        .addPost(req.body)
        .then(() => {
          res.redirect("/posts");
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    }
  }
);

app.use((req, res) => {
  res.status(404).render("404");
});

console.log("Ready for initialize");
blogService
  .initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
    console.log(err);
  });
