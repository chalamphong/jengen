#!/usr/bin/env node
const meow = require("meow");
import jen from "./";
import help from "./help";

const cli = meow(help);

jen(cli.input[0], cli.input[1], cli.flags);
