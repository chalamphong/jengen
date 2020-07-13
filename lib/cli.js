#!/usr/bin/env node
"use strict";
const meow = require("meow");
const jen = require("./");

const cli = meow(`
Usage
  $ jen gen [input]

Options
  --module  A module name based on config.

Examples
  $ jen gen --module component --filename Button
`);

jen(cli.input[0], cli.flags);
