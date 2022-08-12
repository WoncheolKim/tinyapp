// express node app
const express = require("express");
// const morgan = require('morgan'); (11th class)

// const cookieParser = require('cookie-parser');
const cookieParser = require("cookie-parser");

// const bcrype = require('bcrypt'); (11th class)

const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs")


// Middleware

// app.use(morgan('dev')); (11th class)
app.use(cookieParser());
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello! This is James!!");
  res.render("urls");
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
  if (!user) {
    return res.redirect("/urls");
  }
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  if (urlDatabase[templateVars.id]) {
    return res.redirect(templateVars.longURL);
  }
  res.status(404).send("Invalid URL");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (!users[req.cookies.user_id]) {
    return res.send("Please register first");
  }
  const id = generateRandomString();
  urlDatabase [id] = req.body.longURL
  res.redirect(`/u/${id}`);
});


app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


// login Route
app.get("/login", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

// login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
    console.log(users);
    for (let userId in users) {
      console.log("loginkey", userId);
      let user = users[userId];
      console.log("useruser", user);
      if (email === user.email && password === user.password) {
        res.cookie("user_id", user.id);
        return res.redirect("/urls");
      }
      if (email === user.email && password !== user.password) {
        return res.status(403).send("Enter correct password");
      }
    }
    return res.status(403).send("E-mail cannot be found");
    
 });


/* login (11th class) 
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  console.log('req.body', req.body);
  // // bcrypt.compare(req.body.password, users[req.body.username].password)
  .then((result) => {
    console.log('do the passwords match?', result);
    if (result) {
      req.session.username = users[req.body.username]
    }
  })
});
*/


// logout
app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Logout Route 
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// // // logout Nally (11th class)
// app.get('/logout', (req, res) => {
//   // clear the cookie
//   // res.clearCookie('')
//   // delete the session variable
//   delete req.session.username;
//   res.redirect('home');
// });



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






// Registeration 
app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.cookies.user_id] };
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
  const email = req.body.email;
  const password = req.body.password;
  if(email === '' || password === '') {
    return res.status(400).send("Put your email and password");
  }
  if(getUserByEmail(email)) {
    return res.status(400).send("Your email exist");
  }
  
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  console.log(res.cookie['user_id']);
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


/* profie Nally (11th class)
// app.get('profile', (req, res) => {
//   if(req.session.username) {
//     res.render('profile', {username: req.session.username});
//   } else {
//     res.redirect('/login');
//   }
// });
*/

//
// Delete
//

// (11th Class)
app.get('/urls/delete/:id', (req,res) => {
  console.log('delete route key:', req.params.id);
  delete objectives[req.params.id];
  res.redirect('/urls');
});

// app.post("/urls/:id/delete", (req, res) => {
//   delete urlDatabase[req.params.id];
//   res.redirect(`/urls`);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

