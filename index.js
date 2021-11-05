// Integrate a url shortener path to your express app
const express = require("express");
const fs = require("fs");
const util = require("util");
const log = console.log;
const err = console.error;

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

const db = require("./db");
async function redirect(res, code) {
  const url = await getUrl(code).catch(console.error);
  if (url) {
    console.log(`Redirecting to ${url}`);
    return res.redirect(url);
  }
  return res.sendStatus(404);
}

async function getUrl(code) {
  const data = await db.codes.get(code).catch(console.error);
  if (data) {
    return data.url;
  }
  throw new Error("No url found");
}

async function setUrl(code, url, res) {
  await db.codes
    .set(code, url)
    .catch(console.error)
    .then((created) => {
      if (created) {
        console.log(`Created code ${code}`);
        return res.json({ code, url });
      } else {
        throw new Error("Code already exists");
      }
    });
}

async function deleteCode(code) {
  const cd = await db.codes.delete(code).catch(console.error);
  if (cd) {
    return cd;
  } else {
    throw new Error("No code found for deletion");
  }
}

async function getAllCodes() {
  const codes = await db.codes.getAll().catch(console.error);
  if (codes) {
    return codes;
  } else {
    throw new Error("No codes found");
  }
}

async function updateCode(code, url) {
  const cd = await db.codes.updateURL(code, url).catch(console.error);
  if (cd) {
    return cd;
  } else {
    throw new Error("No code found for update");
  }
}

module.exports = {
  redirect,
  setUrl,
  getAllCodes,
  deleteCode,
  updateCode,
};
