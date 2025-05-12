const { Schema } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  favourites: {
    type: Object,
    default: () => ({ "Your favourite stickers": [] }),
  },
});

module.exports = { userSchema };
