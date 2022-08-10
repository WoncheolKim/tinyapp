const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//redirect url details and save
app.get('/urls/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVar);
});
//save and go to website
app.get('/u/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  if (urlDatabase[templateVar.id]) {
    res.redirect(templateVar.longURL);
  }
  res.redirect('/418');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase [id] = req.body.longURL
  res.redirect(`/u/${id}`)
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

function generateRandomString() {
var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
var result = ""
var charactersLength = characters.length;

for ( var i = 0; i < 5 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result;
}
