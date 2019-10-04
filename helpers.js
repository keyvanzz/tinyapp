const getUserByEmail = function(email, users) {
    for (const user in users) {
      if (email === users[user].email) {
        return users[user];
      }
    }
  }

  module.exports = { getUserByEmail }