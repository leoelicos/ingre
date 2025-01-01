const { User } = require('models')

const seedUsers = async () => {
  await Promise.all([
    User.create({
      firstName: 'pro',
      lastName: 'pro',
      email: 'pro@ingre.com',
      password: 'northshore',
      pro: true,
      savedRecipes: []
    }),
    User.create({
      firstName: 'notpro',
      lastName: 'notpro',
      email: 'notpro@ingre.com',
      password: 'northshore',
      pro: false,
      savedRecipes: []
    })
  ])
}

module.exports = seedUsers
