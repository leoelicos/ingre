/*
 * ingre
 * seeds/user-seeds.js
 * This script seeds two Users
 * Copyright 2022 Leo Wong
 */

const { User } = require('../models');

const seedUsers = async () => {
  await Promise.all([
    User.create({
      firstName: 'pro',
      lastName: 'pro',
      email: 'pro@ingre.com',
      password: 'northshore',
      pro: true
    }),
    User.create({
      firstName: 'notpro',
      lastName: 'notpro',
      email: 'notpro@ingre.com',
      password: 'northshore',
      pro: false
    })
  ]);
};

module.exports = seedUsers;
