const { assert } = require('chai');

const { findUserEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48gh" }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  });
  it("should return undefined when passed an email that doesn't exist in the database", function() {
    const user = findUserEmail("hello@world", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});


describe('urlsForUser', function() {
  it("should return all of the urls belong to the given user, and filter out those that don't belong to them", function() {
    const urls = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput =   { b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" } }
    assert.deepEqual(urls, expectedOutput);
  })
});
