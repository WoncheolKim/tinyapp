const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
} = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["light", "house"],
    maxAge: 24 * 60 * 60 * 1000, 
  })
);

const users = {};

// Root Path

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urlDatabase: urlsForUser(req.session.user_id),
    user,
  };
  res.render("urls", templateVars);
});

app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("You didn't login");;
  }
  let templateVars = {
    urlDatabase: urlsForUser(user_id),
    user: users[user_id],
  };
  res.render('urls_index', templateVars);
});

// URLS Create
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    const url = longURL["longURL"];
    res.redirect(url);
  } else {
    res.statusCode = 404;
    return res.status(400).send("It does not exist");
  }
});

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if(!longURL) {
    return res.status(404).send("It does not exist");
  }
  const user = users[req.session.user_id];
  if(!req.session.user_id === longURL.userID) {
    return res.status(404).send("It does not exist");
  }
  const templateVars = {
    user,
    id: req.params.id,
    longURL: longURL.longURL,
    urls: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

// Users Login
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
});

// Users Create
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.render('registration', templateVars);
  }
});


app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("You didn't login");;
  }
  let id = generateRandomString();
  urlDatabase[id] = { 
    longURL: req.body.longURL, 
    userID: user_id 
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("You didn't login");
  }
  let url = urlDatabase[req.params.id];
  if (url && url.userID === user_id) {
    url = {
      longURL: req.body.newLongURL,
      userID: user_id,
    };
    urlDatabase[req.params.id] = url;
    return res.redirect("/urls");
  } else {
    return res.status(403).send("This URL belongs to a different user");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(400).send("You didn't login");
  }
  if (user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect(`/urls`);
  } 
  return res.status(403).send("This URL belongs to a different user");

});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = getUserByEmail(email, users);
  if (userId) {
    if (bcrypt.compareSync(password, users[userId].password)) {
      req.session.user_id = userId;
      return res.redirect("/urls");
    }  
    return res.status(401).send("Error : Please re-enter your Email or Password");
  }
  return res.status(401).send("Error : User doesn't exist");
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const currentEmailExist = getUserByEmail(email, users);
  if (currentEmailExist) {
    return res.status(400).send(`Email already exists`);
  } 
  if (email && password) {
    for (let key in users) {
      if (users[key].email === email) {
        let templateVars = {
          user: users[req.session.user_id],
          message: 'Email already exists',
        };
        res.render('error', templateVars);
        return;
      }
    }
    const id = generateRandomString(10);
    const newUser = {
      id,
      email,
      password: bcrypt.hashSync(password, 10),
    };
    users[id] = newUser;
    req.session.user_id = id;
    res.redirect('/urls');
    return;
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      message: 'Enter you email and password',
    };
    res.render('error', templateVars);
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// SERVER - Listening
app.listen(PORT, () => {
});
