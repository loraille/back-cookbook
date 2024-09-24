const mongoose = require('mongoose');
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      select: false,
      validate: {
        validator: (val) => EMAIL_REGEX.test(val),
        message: ({ value }) => `${value} is not a valid email address.`,
      },
    },
    token: String,
    password: String,
    recettes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'recettes' }],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('Users', userSchema);

module.exports = User;
