const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
module.exports = mongoose.model("Expression", Expression);
