/*
 * ingre
 * server/models/index.js
 * This script contains the necessary code to define the NoSQL database for ingre
 * Copyright 2022 Leo Wong
 */

const User = require('./User');
const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const Category = require('./Category');
const Order = require('./Order');
const Product = require('./Product');

module.exports = { User, Recipe, Ingredient, Category, Order, Product };
