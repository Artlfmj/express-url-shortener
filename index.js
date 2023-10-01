const express = require("express");
const fs = require("fs");
const util = require("util");
const log = console.log;
const err = console.error;

const app = express();
const port = process.env.PORT || 3000;

// Initialize folders and files
function initialize() {
  const foldersToCreate = ["db", "logs"];
  foldersToCreate.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  });

  const filesToCreate = ["db/codes.json", "logs/log.log", "logs/error.log"];
  filesToCreate.forEach((file) => {
    if (!fs.existsSync(file)) {
      let text = "";
      if (file.endsWith(".json")) {
        text = [];
        text = JSON.stringify(text, null, 2);
      }
      fs.writeFileSync(file, text);
    }
  });
}

// Initialize logger
function initializeLogger() {
  const logFile = fs.createWriteStream(__dirname + `/logs/log.log`, {
    flags: "a",
  });

  console.log = function (d) {
    logFile.write(util.format(d) + "\n");
    log.apply(console, arguments);
  };

  const errFile = fs.createWriteStream(__dirname + `/logs/error.log`, {
    flags: "a",
  });

  console.error = function (d) {
    errFile.write(util.format(d) + "\n");
    err.apply(console, arguments);
  };
}

// Initialize the app
function initializeApp() {
  initialize();
  initializeLogger();
}

// Initialize the app
initializeApp();

// Your existing code for database and functions
const db = require("./db");

async function redirect(res, code) {
  try {
    const url = await getUrl(code);
    console.log(`Redirecting to ${url}`);
    return res.redirect(url);
  } catch (error) {
    console.error(error.message);
    return res.sendStatus(404);
  }
}

async function getUrl(code) {
  const data = await db.codes.get(code);
  if (data) {
    return data.url;
  }
  throw new Error("No url found");
}

async function setUrl(code, url, res) {
  try {
    const created = await db.codes.set(code, url);
    if (created) {
      console.log(`Created code ${code}`);
      return res.json({ code, url });
    } else {
      throw new Error("Code already exists");
    }
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message });
  }
}

async function deleteCode(code) {
  try {
    const cd = await db.codes.delete(code);
    if (cd) {
      return cd;
    } else {
      throw new Error("No code found for deletion");
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function getAllCodes() {
  try {
    const codes = await db.codes.getAll();
    if (codes) {
      return codes;
    } else {
      throw new Error("No codes found");
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

async function updateCode(code, url) {
  try {
    const cd = await db.codes.updateURL(code, url);
    if (cd) {
      return cd;
    } else {
      throw new Error("No code found for update");
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Set up Express routes for URL shortening and redirection
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  await redirect(res, code);
});

app.post("/shorten", express.json(), async (req, res) => {
  const { code, url } = req.body;
  await setUrl(code, url, res);
});

// Add more routes for managing codes as needed

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
