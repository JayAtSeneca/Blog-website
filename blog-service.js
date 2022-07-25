const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "d7mt13kc1hlms3",
  "ztevletopwgigl",
  "02f338aac8fe8287237e1a68b1b67d1de2c6d67cb318e1ccfb2bdc941bd35a86",
  {
    host: "ec2-52-203-118-49.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Post = sequelize.define("Post", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: Sequelize.STRING,
  body: Sequelize.TEXT,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(function () {
        resolve({ msg: "Successfully Connected to Database" });
      })
      .catch((err) => {
        reject({ msg: "unable to connect with Database" });
      });
  });
};

module.exports.getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getPublishedPosts = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { published: true },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.getCategories = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Category.findAll()
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.addPost = (postData) => {
  return new Promise((resolve, reject) => {
    if (postData.body == "") {
      postData.body = null;
    }
    if (postData.title == "") {
      postData.title = null;
    }
    if (postData.postDate == "") {
      postData.postDate = null;
    }
    if (postData.featureImage == "") {
      postData.featureImage = null;
    }
    if (postData.published == undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    if (postData.category == "") {
      postData.category = null;
    }
    postData.published = postData.published ? true : false;
    postData.postDate = new Date();
    sequelize.sync().then(function () {
      Post.create(postData)
        .then(resolve(console.log("Data was created")))
        .catch(function () {
          reject("unable to create post");
        });
    });
  });
};

module.exports.getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { category: category } })
      .then((posts) => {
        if (posts.length != 0) {
          resolve(posts);
        } else {
          reject({ msg: "no results returned" });
        }
      })
      .catch(() => {
        reject({ msg: "no results returned" });
      });
  });
};

module.exports.getPostsByMinDate = (minDateStr) => {
  const { gte } = Sequelize.Op;
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { postDate: { [gte]: new Date(minDateStr) } } })
      .then((posts) => {
        if (posts.length != 0) {
          resolve(posts);
        } else {
          reject({ msg: "no results returned" });
        }
      })
      .catch(() => {
        reject({ msg: "no results returned" });
      });
  });
};

module.exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { id: id },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.getPublishedPostsByCategory = (category) => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(function () {
      Post.findAll({
        where: { published: true, category: category },
      })
        .then(function (data) {
          resolve(data);
        })
        .catch(function () {
          reject(console.log("no results returned"));
        });
    });
  });
};

module.exports.addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    if (categoryData.category == "") {
      categoryData.category = null;
    }
    sequelize.sync().then(function () {
      Category.create(categoryData)
        .then(resolve(console.log("Data is created")))
        .catch(reject("Unable to create category"));
    });
  });
};

module.exports.deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Category.destroy({
        where: { id: id },
      })
        .then(resolve(console.log("destroyed")))
        .catch(reject("Unable to destroyed category"));
    });
  });
};

module.exports.deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    sequelize.sync().then(function () {
      Post.destroy({
        where: { id: id },
      })
        .then(resolve(console.log("destroyed")))
        .catch(reject("Unable to destroyed category"));
    });
  });
};
