const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("view engine", "ejs")
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

//redirect url details and save
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

//save and go to website
app.get('/u/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  if (urlDatabase[templateVar.id]) {
    res.redirect(templateVar.longURL);
  }
  res.redirect('/418');
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase [id] = req.body.longURL
  res.redirect(`/u/${id}`)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const { id } = req.params
  const { longURL } = req.body
  urlDatabase[id] = longURL
  res.redirect("/urls");
  // console.log(req.body); // Log the POST request body to the console
  // const id = generateRandomString();
  // urlDatabase [id] = req.body.longURL
  // res.redirect(`/u/${id}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

