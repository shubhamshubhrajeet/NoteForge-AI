const Datastore = require("nedb-promises");
const path = require("path");
const fs = require("fs");

const DB_DIR = path.resolve(process.env.DB_PATH || "./db");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const make = (name) =>
  Datastore.create({ filename: path.join(DB_DIR, name), autoload: true });

const filesDB = make("files.db");
const searchDB = make("search.db");
const usersDB = make("users.db");
const videosDB = make("videos.db");
const commentsDB = make("comments.db");

module.exports = { filesDB, searchDB, usersDB, videosDB, commentsDB };
