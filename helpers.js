const getUserByEmail = function(email, users) {
    for (const userID in users) {
      if (email === users[userID].email) {
        return userID;
      }
    }
    return undefined;
  }

  module.exports = { getUserByEmail }