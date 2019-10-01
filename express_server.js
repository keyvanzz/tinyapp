const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.json("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // Log the POST request body to the console
  // add new long url to urlDatabase
  const shortURL  = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);// esponds with a redirect to /urls/:shortURL
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  res.render("urls_show", { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]});
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
