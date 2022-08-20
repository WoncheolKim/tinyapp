const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId]["id"];
    }
  }
  return null;
};

const urlsForUser = function(id) {
  const userurl = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userurl[url] = urlDatabase[url].longURL;
    };
  }
  return userurl;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
};