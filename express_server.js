const express = require("express");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//Middleware Vendors
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "1" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "2" }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = { 
  "1": {
    email: "123@example.com", 
    password: "123",
    id: "1"
  },
 "2": {
    email: "user2@example.com", 
    password: "dishwasher-funk",
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
  const userID = req.cookies["user_id"]
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
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req,res) => {
  const userID = req.cookies["user_id"]
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
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  res.redirect(`/urls/${shortURL}`);// esponds with a redirect to /urls/:shortURL
});

app.get("/register", (req,res) => {
  res.render("register", {user: ""});
});

app.post("/register", (req, res) => {
  // validate input
  if(req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("<h1>Please enter your email or password!</h1>")
    return;
  }
  for (const user in users) {
    if (req.body.email === users[user].email) {
      res.status(400).send(`<h1>Account associated with ${req.body.email} already exists!</h1>`)
      return;
    }
  }
  // validate data - i.e. email is string
  // more validation -  tries to register with an email that is already in the users objec
  let newUser = {
    email: req.body.email, 
    password: req.body.password,
    id: generateRandomString()
  }
  users[newUser.id] = newUser;
  console.log(users);
  res.cookie("user_id", newUser.id);
  res.redirect(`/urls`);// esponds with a redirect to /urls/:shortURL
});

app.get("/login", (req,res) => {
  res.render("login", {user: ""});
});

app.post("/login", (req,res) => {
  let userObject = undefined;
  for (const user in users) {
    if (req.body.email === users[user].email ) {
      if (req.body.password === users[user].password) {
        userObject = users[user]
        res.cookie("user_id", users[user].id);
        // LOGIN - USE RES.COOKIE TO SET COOKIE
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("<h1>The username or password you entered is incorrect!</h1>")
        return;
      }
 
    } 
      userObject = undefined 
  }

  if(!userObject){
    res.status(403).send(`<h1>An account associated with ${req.body.email} does not exist</h1>`)
  } 
  
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"]
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"]
  const newUrl = {longURL: req.body.longURL, userID: userID}
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = newUrl;
    res.redirect("/urls");
  } else {
    res.status(403).send(`Permission Denied!`)
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_id"]
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
  res.clearCookie("user_id");
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});