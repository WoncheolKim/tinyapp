const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

// Middleware

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
  res.send("Hello! This is James!!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {user, urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

//redirect url details and save
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
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

// login
app.post("/login", (req, res) => {
  const user_id = req.body.user_id;
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

// Login Routes
app.get("/login", (req, res) => {
  res.redirect("/login");
});

// logout
app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Logout Route 
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
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
};

// Registeration 
app.get("/register", (req, res) => {
  const templateVars = {};
  res.render("registration", templateVars);
});

// registreration 
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const getUserByEmail = () => {
    if(email === '' || password === '') {
      return res.send("error 400");
    }
    if(emailExist) {
      return res.send("error 400");
    }
  }
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  console.log(res.cookie['user_id']);
  res.redirect("/urls");

  
  // const templateVars = { username: req.cookies["username"] }
  // res.render("register", templateVars);
}); 



// Profile Page
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



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

