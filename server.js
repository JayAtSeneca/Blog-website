/*********************************************************************************
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
 *
 * Name: Jay Pravinkumar Chaudhari
 * Student ID: 147268205
 * Date: 16/06/2022
 *
 * Online (Heroku) URL: https://lit-castle-17301.herokuapp.com/
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

var HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dltn1ghdm',
    api_key: '884661395299724',
    api_secret: '8ZDycm8695UflqV_kEC0D26s-3k',
    secure: true
  });

const upload = multer();

function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((data) => {
      console.log("getPublishedPosts displayed.");
      res.json(data);
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
      res.json(err);
    });
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogService
      .getPostByCategory(req.query.category)
      .then((data) => {
        console.log("getAllPosts by category displayed.");
        res.json(data);
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.json(err);
      });
  } else if (req.query.minDate) {
    blogService
      .getPostByMinDate(req.query.minDate)
      .then((data) => {
        console.log("getAllPosts by minDate displayed.");
        res.json(data);
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.json(err);
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        console.log("getAllPosts displayed.");
        res.json(data);
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.json(err);
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
    .then((data) => {
      console.log("getCategories displayed.");
      res.json(data);
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
      res.json(err);
    });
});

app.get('/posts/add',function(req,res) {
  res.sendFile(path.join(__dirname+'/views/addPost.html'));
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
  res.status(404).send("Page Not Found");
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
