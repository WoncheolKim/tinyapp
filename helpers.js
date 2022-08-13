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


function generateRandomString() {
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = ""
  var charactersLength = characters.length;
  for ( var i = 0; i < 5 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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


function getUserByEmail(email, users) {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
};