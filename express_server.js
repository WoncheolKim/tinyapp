const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const PORT = 8080;
const app = express();
app.set("view engine", "ejs")

// Middleware

// app.use(morgan('dev')); (11th class)
app.use(cookieSession({
    name: "session",
    keys: ["light", "house"],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true }));


function generateRandomString() {
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = ""
  var charactersLength = characters.length;
  for ( var i = 0; i < 5 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

  // User_id Data
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

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user3RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user3RandomID",
  },
};

function urlsForUser(newID) {
  const urlForUser = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === newID) {
      urlForUser[url] = urlDatabase[url];
    }
  }
  return urlForUser;
}

app.get("/", (req, res) => {
  res.send("Hello! This is James!!");
  res.render("urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const userID = req.session.user_id;
  const urlForUsers = urlsForUser(userID);
  const templateVars = {user, urls: urlForUsers};
  if (!users[req.session.user_id]) {
    return res.send("Please login first");
  }
  res.render("urls_index", templateVars);
});

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

//redirect url details and save
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

//save and go to website
app.get('/u/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL};
  if (urlDatabase[templateVars.id]) {
    return res.redirect(templateVars.longURL);
  }
  res.send("Invalid URL");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (!users[req.session.user_id]) {
    return res.send("Please register first");
  }
  const id = generateRandomString();
  urlDatabase[id] = { longURL : req.body.longURL }
  res.redirect(`/u/${id}`);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// login Route
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
// login
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

// logout
app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

// Logout Route 
app.get("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});

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

// Registeration 
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});

function getUserByEmail(email) {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
}

// registreration 
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


// Profile Page (11th class)
// app.get('/profile',(req,res) => {

//   if(user_id[req.cookies.user]) { // if the user is authenticated
//     const templateVars = { user: req.cookies.user, password: user_id[req.cookies.user] };
//     res.render('profile', templateVars);
//     return;
//   } 
//     res.redirect('/login');
//     return;
// });

// app.post('/profile',(req,res) => {
//   console.log("profile req.body:",req.body);
//   const newPassword = req.body.newpassword;
//   user_id[req.cookies.user] = newPassword;
//   res.redirect('/');
// });


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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
