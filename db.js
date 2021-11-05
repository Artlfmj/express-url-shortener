const fs = require("fs");
async function codesget(code) {
  // Check if path exists . If yes return the json else throw error
  const codes = JSON.parse(fs.readFileSync("./db/codes.json", "utf8"));
  if (codes.find((x) => x.code === code)) {
    return codes.find((x) => x.code === code);
  } else {
    throw new Error("Invalid code");
  }
}

async function codesset(code, url) {
  const codes = JSON.parse(fs.readFileSync("./db/codes.json", "utf8"));
  if (codes.find((x) => x.code === code)) {
    throw new Error("Code already exists");
  } else {
    codes.push({
      code: code,
      url: url,
    });
    fs.writeFileSync("./db/codes.json", JSON.stringify(codes));
    return { code: code, url: url };
  }
}

async function codesgetAll() {
  const codes = JSON.parse(fs.readFileSync("./db/codes.json", "utf8"));
  return codes;
}

async function deleteCode(code) {
  const codes = JSON.parse(fs.readFileSync("./db/codes.json", "utf8"));
  if (codes.find((x) => x.code === code)) {
    codes.splice(codes.indexOf(codes.find((x) => x.code === code)), 1);
    fs.writeFileSync("./db/codes.json", JSON.stringify(codes));
    return { code: code };
  } else {
    throw new Error("Invalid code");
  }
}

async function updateURL(code, url) {
  const codes = JSON.parse(fs.readFileSync("./db/codes.json", "utf8"));
  if (codes.find((x) => x.code === code)) {
    codes.find((x) => x.code === code).url = url;
    fs.writeFileSync("./db/codes.json", JSON.stringify(codes));
    return { code: code, url: url };
  } else {
    throw new Error("Invalid code");
  }
}

module.exports = {
  codes: {
    get: codesget,
    set: codesset,
    getAll: codesgetAll,
    delete: deleteCode,
    updateURL: updateURL,
  },
};
