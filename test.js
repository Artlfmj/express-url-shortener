const shortener = require(".");
const express = require("express");
const app = express();
// Body parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/redirect/:code", async (req, res) => {
  shortener.redirect(res, req.params.code).catch(console.error);
});

app.post("/redirections/create/", async (req, res) => {
  if (!req.body.code || !req.body.url) throw new Error("Missing code or url");
  shortener.setUrl(req.body.code, req.body.url, res).catch(console.error);
});

app.get("/redirections/", async (req, res) => {
  const codes = await shortener.getAllCodes();
  res.json(codes);
});
app.post("/redirections/delete/", async (req, res) => {
  if (!req.body.code) throw new Error("Missing code");
  let code = await shortener.deleteCode(req.body.code).catch(console.error);
  if (code) res.json({ code: code, message: "Code was deleted" });
  else res.json({ error: "Code not found" });
});

app.post("/redirections/update", async (req, res) => {
  let code = await shortener
    .updateCode(req.body.code, req.body.url)
    .catch(console.error);
  if (code) res.json({ code: code, message: "Code was updated" });
  else res.json({ error: "Code not found" });
});

app.listen(81);
