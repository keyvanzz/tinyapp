const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers')
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//Middleware Vendors
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret_keys'],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}))
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.example.com", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.example2.com", userID: "aJ48lW" }
};

const users = { 
  "aJ48lM": {
    email: "user1@example.com", 
    password: "passw0rd!",
    id: "1"
  },
 "aJ48lW": {
    email: "user2@example.com", 
    password: "passw0rd!",
    id: "2"
  }
}

const userUrls = function(userID) {
  let matchedUrls = {}
  for (const url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      matchedUrls[url] = urlDatabase[url];
    }
  }
  return matchedUrls;
}

//App Routes
app.get("/urls", (req, res) => {
  const userID = req.session.userId;
  const templateVars = { urls: userUrls(userID), user: users[userID] };
  if (!userID) {
    res.render("urls_index", templateVars)
  } else {
    const urls = {};
    for (const key in urlDatabase) {
      if (userID === urlDatabase[key].userID) {
        urls[key] = urlDatabase[key];
      }
    }
    console.log(users)
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req,res) => {
  const userID = req.session.userId;
  let templateVars = { urls: userUrls(userID), user: users[userID] }
  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.post("/urls", (req, res) => {
  // add new long url to urlDatabase
  const shortURL  = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect(`/urls/${shortURL}`);// esponds with a redirect to /urls/:shortURL
});

app.get("/register", (req,res) => {
  res.render("register", {user: ""});
});

app.post("/register", (req, res) => {
  // validate input
  let user = getUserByEmail(req.body.email, users)
  if (user) {
    return res.status(400).send(`<h1>Account associated with ${req.body.email} already exists!</h1>`)
  } 
  if(req.body.email.length === 0 || req.body.password.length === 0) {
    return res.status(400).send("<h1>Please enter your email or password!</h1>");
  }
  // validate data - i.e. email is string
  // more validation -  tries to register with an email that is already in the users objec
  let newUser = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10),
    id: generateRandomString()
  }
  users[newUser.id] = newUser;
  console.log(users);
  req.session.userId = newUser.id; //REGISTER - USE req.session.userId = "some value"; TO SET COOKIE
  res.redirect(`/urls`);// esponds with a redirect to /urls/:shortURL
});

app.get("/login", (req,res) => {
  res.render("login", {user: ""});
});

app.post("/login", (req,res) => {
  let user = getUserByEmail(req.body.email, users)
  if (!user) {
    return res.status(403).send(`<h1>An account associated with ${req.body.email} does not exist</h1>`);
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userId = user.id; // LOGIN - USE req.session.userId = "some value"; TO SET COOKIE
    res.redirect("/urls");
    return;
  } else {
    return res.status(403).send("<h1>The username or password you entered is incorrect!</h1>");
  }
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userId;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userId;
  const newUrl = {longURL: req.body.longURL, userID: userID}
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = newUrl;
    res.redirect("/urls");
  } else {
    res.status(403).send(`Permission Denied!`)
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userId
  const templateVars = { urls: userUrls(userID), user: users[userID] };
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else{
    res.status(403).send(`Permission Denied!`)
    // res.render("urls_index", templateVars)
  }
  // let shortURL = req.params.shortURL;
  // delete urlDatabase[shortURL];
  // res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});