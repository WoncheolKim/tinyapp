const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const PORT = 8080;
const app = express();
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
} = require("./helpers");

//
// MIDDLEWARE
//
app.set("view engine", "ejs")
app.use(cookieSession({
    name: "session",
    keys: ["light", "house"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true }));

//
// USER DATABASE
//
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "11@1.com",
    password: "11",
  },
};


//
// / GET
//
app.get("/", (req, res) => {
  res.send("Hello! This is James!!");
  res.render("urls");
});

//
// /urls.json
//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//
// /u/:id GET
//
app.get('/u/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
  if (urlDatabase[templateVars.id]) {
    return res.redirect(templateVars.longURL);
  }
  res.send("Invalid URL");
});

//
// /urls GET
//
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userID = req.session.user_id;
  const urlForUsers = urlsForUser(userID);
  const templateVars = {user, urls: urlForUsers};
  if (!users[req.session.user_id]) {
    return res.send("Not logged in. Please <a href='/login'>login</a>");
  }
  res.render("urls_index", templateVars);
});

//
// /urls POST
//
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (!users[req.session.user_id]) {
    return res.send("Please register first");
  }
  const id = generateRandomString();
  urlDatabase[id] = { longURL : req.body.longURL }
  res.redirect(`/u/${id}`);
});

//
// /urls/:id GET
//
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("Please register first");
  }
  const urlForUsers = urlsForUser(req.session.user_id);
  if (!urlForUsers[req.params.id]) {
    return res.send("Not authorized");
  }
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    urls: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

//
// /urls/:id POST
//
app.post("/urls/:id", (req, res) => {
  const { id } = req.params
  const { longURL } = req.body
  if (!id) {
    return res.send("your ID doesn't exist");
  }
  if (!users[req.session.user_id]) {
    res.send("You need to login");
    return;
  }
  const urlForUsers = urlsForUser(req.session.user_id);
  if (!urlForUsers[req.params.id]) {
    return res.send("It is not yours");
  }
  urlDatabase[id].longURL = longURL
  res.redirect("/urls");
});

//
// /urls/new GET
//
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

//
// /urls/:id/update POST
//
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//
// LOGIN GET
//
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});
const checkemailexist = function (email, userdatabase) {
  for (let userId in userdatabase) {
    if(email === userdatabase[userId].email) {
      return userdatabase[userId]
    }
  }
return false;
}

//
// LOGIN POST 
//
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = checkemailexist(email, users)
  if(!user) {
    return res.status(403).send("Email is not exist");
    }
  if (!bcrypt.compareSync(req.body.password,user.password)) {
    return res.status(403).send("password is not correct");
    }
    req.session.user_id = user.id;
    res.redirect("/urls");
});

//
// LOGOUT GET
//
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//
// LOGOUT POST
//
app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  req.session = null;
  res.redirect("/urls");
});

//
// REGISTRATION 
//
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  if(req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Put your email and password");
  }
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if(getUserByEmail(email)) {
    return res.status(400).send("Your email exist");
  }
  users[id] = {
    id,
    email,
    password,
  };
  req.session.user_id = id;
  res.redirect("/urls");
}); 

//
// DELETE
//
app.get('/urls/delete/:id', (req,res) => {
  console.log('delete route key:', req.params.id);
  delete objectives[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params
  if (!id) {
    return res.send("your ID doesn't exist");
  }
  if (!users[req.session.user_id]) {
    return res.send("You need to login");
  }
  const urlForUsers = urlsForUser(req.session.user_id);
  if (!urlForUsers[req.params.id]) {
    return res.send("It is not yours");
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//
// LISTEN TO PORT
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
