const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure
const Expression = new Schema(
    {
      expression: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    },
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Expression", Expression);
