const generateActions = ["gen", "generate", "make", "clone"];

const help = `
Usage
  $ jen gen [input]

  You can replace gen with any of the following commands
  
  ${generateActions.join(", ")}

Options
  --module  A module name based on config.

Examples
  $ jen gen --module component --filename Button
  $ jen generate --module component --filename Button

`;

export default help;
