const findUserEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

const generateRandomString = function() {
  const anysize = 6;
  const charset = "abcdefghijklmnopqrstuvwxyz";
  let i = 0;
  let ret = '';
  while (i++ < anysize) {
    ret += charset.charAt(Math.random() * charset.length);
  }
  return ret;
};

const urlsForUser = function(id, urlDatabase) {
  let userObj = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userObj[key] = urlDatabase[key];
    }
  }
  return userObj;
};

module.exports = { findUserEmail, generateRandomString, urlsForUser };