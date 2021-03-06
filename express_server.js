const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const PORT = 8080;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  secret: 'Alan',
  // Some cookie options
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  b6UTxQ: { longURL: "http://www.lighthouselabs.ca", userID: "b2xVn2" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const { findUserEmail, generateRandomString, urlsForUser } = require("./helpers");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "example@gmail.com",
    password: bcrypt.hashSync("dsfre2", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Get Routes

// Reoute renders create URL

app.get("/urls/new", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let user = users[id];
    let templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Route renders the page for logged in users new short URL

app.get("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  if (id) {
    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        let user = users[id];
        let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
        res.render("urls_show", templateVars);
        return;
      }
    }
    res.send("This URL doesnt belong to you!");
  } else {
    res.send("Please go back and register your account or login to access!");
  }
});

// Hyperlink to long URL page

app.get("/u/:shortURL", (req, res) => {
  let shortURL =  req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("This URL does not exist!");
  }
});

// Rengers login page for user

app.get("/login", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

// Renders registration page for user

app.get("/register", (req, res) => {
  let id = req.session.user_id;
  let user = users[id];
  let templateVars = { user };
  res.render("urls_registration", templateVars);
});

// Rengers urls page for a logged in user

app.get("/urls", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let urls = urlsForUser(id, urlDatabase);
    let user = users[id];
    let templateVars = { urls, user };
    res.render("urls_index", templateVars);
  } else {
    res.send("Sorry, please go back and login to view your URL's!");
  }
});

// Home route which depending if user is logged in, to either urls or login

app.get("/", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Database to JSON object

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Post routes

// Deletes logged in user

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (id) {
    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        delete urlDatabase[shortURL];
        res.redirect("/urls");
        return;
      }
    }
    res.send("This URL does not belong to you! Please go back to creat a new one!");
  } else {
    res.send("This URL does not belong to you! Please go back and login in!");
  }
});

// Edits logged in users long URL, redirects to home page

app.post("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortURL = req.params.shortURL;
  let newLong = req.body.longURL;
  if (id) {
    let userObj = urlsForUser(id, urlDatabase);
    for (let key in userObj) {
      if (shortURL === key) {
        urlDatabase[shortURL].longURL = newLong;
        res.redirect(`/urls`);
        return;
      }
    }
    res.send("This URL does not belong to you!");
  } else {
    res.send("Please Login or register to view your URLs!");
  }
});

// Checks user email/password are correct before log in

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userObject = (findUserEmail(userEmail, users));
  if (userObject) {
    if (bcrypt.compareSync(userPassword, userObject.password)) {
      req.session.user_id = userObject.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Password is not correct");
    }
  } else {
    res.status(403).send("Email does not exist");
  }
});

// Logs user out and deletes cookie

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Registers user and checks if log in info already exists, if not, creates new

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (findUserEmail(userEmail, users)) {
    res.status(400).send("Email already exists");
  }
  if (userEmail.length === 0 || userPassword.length === 0) {
    res.status(400).send("Email or password is not defined");
  }
  users[userId] = {id: userId, email: userEmail, password: hashedPassword};
  req.session.user_id = userId;
  res.redirect("/urls");
});

// If user is logged in, redirects to chosen short URL page

app.post("/urls", (req, res) => {
  let id = req.session.user_id;
  if (id) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID: id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Please go back and Login first!");
  }
});

// Sets message when server connects to PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});