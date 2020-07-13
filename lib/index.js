"use strict";

function run(action, flags) {
  console.log(action, flags);
  if (action === "gen") {
    console.log("Generating");
  }
}

module.exports = run;
