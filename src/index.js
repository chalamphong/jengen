import chalk from "chalk";
import fs from "fs";
import path from "path";
import { hydrate } from "./utils";

const generateActions = ["gen", "generate", "make", "clone"];
const sourceTypes = {
  file: "file",
  directory: "directory"
};

const generateErrorLog = (message, modifier) => {
  const supportedModifiers = ["bold", "italic"];
  if (!supportedModifiers.includes(modifier)) {
    return chalk.redBright(message);
  }

  return chalk.redBright[modifier](message);
};

const generateInfoLog = (message, modifier) => {
  const supportedModifiers = ["bold", "italic"];
  if (!supportedModifiers.includes(modifier)) {
    return chalk.cyan(message);
  }

  return chalk.cyan[modifier](message);
};

const generateWarnLog = (message, modifier) => {
  const supportedModifiers = ["bold", "italic"];
  if (!supportedModifiers.includes(modifier)) {
    return chalk.yellow(message);
  }

  return chalk.yellow[modifier](message);
};

const loadConfig = () => {
  const configFileName = "jen.config.json";
  const configFilePath = path.resolve(configFileName);
  try {
    const configString = fs.readFileSync(configFilePath);
    const config = JSON.parse(configString);
    return config;
  } catch {
    throw new Error(`
😭 Failed to load or parse config file.
Make sure the file is 
  1. Config file name is ${configFilePath},
  2. It exists in the root of your app,
  3. You are running the command from the root of your app 
    `);
  }
};

const run = (action, flags) => {
  if (generateActions.includes(action)) {
    generate(flags);
  } else {
    const log = `${generateErrorLog(
      "🤷‍♀️ Command is confusing. Ask for help by typing"
    )} ${generateErrorLog("jen --help", "italic")}`;
    console.log(log);
  }
};

const cloneFile = (source, destination, flags) => {
  return new Promise((resolve, reject) => {
    process.stdout.write(`Generating file at ${destination}`);

    const fileContent = fs.readFileSync(source, "utf8");
    const hydratedContent = hydrate(fileContent, flags);

    fs.writeFile(destination, hydratedContent, "utf8", err => {
      if (err) {
        process.stdout.write(generateErrorLog(`❌ ${err.message}`));
        process.stdout.write("\n");
        return reject(err);
      }

      process.stdout.write(` ✅`);
      process.stdout.write("\n");
      return resolve();
    });
  });
};

const cloneDirectory = (source, destination, flags) => {
  return new Promise((resolve, reject) => {
    fs.readdir(source, async (err, files) => {
      if (err) {
        console.log("Error reading files from directory", source);
        return reject(err);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(source, file);

        const fileStat = fs.statSync(filePath);
        const hydratedName = hydrate(file, flags);

        const destinationPath = path.join(destination, hydratedName);
        if (fileStat.isDirectory()) {
          // Hydrate name
          console.log("Generating directory at", chalk.bold(destinationPath));
          if (fs.existsSync(destinationPath)) {
            console.log(
              generateWarnLog(`Directory already exists. Skipping ...`)
            );
          } else {
            fs.mkdirSync(destinationPath);
          }

          /* eslint-disable-next-line no-await-in-loop */
          await cloneDirectory(filePath, destinationPath, flags);
        } else if (fileStat.isFile()) {
          try {
            /* eslint-disable-next-line no-await-in-loop */
            await cloneFile(filePath, destinationPath, flags);
          } catch {
            // Catching error so other files can be cloned
          }
        }
      }

      resolve();
    });
  });
};

const generate = flags => {
  const module = flags.module;
  console.log(chalk.cyan("👷‍♀️ Generating new", module));
  try {
    const config = loadConfig();
    const modules = config.modules || {};

    const moduleConfig = modules[module];

    if (!moduleConfig) {
      console.log(
        generateErrorLog(`
😅 Config for the module not found.
Please verify that your json config file has ${module} as under "modules" root key
`)
      );
      return;
    }

    const { source, destination } = moduleConfig;
    const logParts = [
      generateInfoLog(`
💁‍♀️ Will use`),
      generateInfoLog(source, "bold"),
      generateInfoLog(`as template and generate module into`),
      generateInfoLog(destination, "bold")
    ];
    console.log(...logParts);

    // Verfify source exists
    const sourceExists = fs.existsSync(source);

    if (!sourceExists) {
      const logParts = [
        generateErrorLog(`
🙅‍♀️ Module source not found`),
        generateErrorLog(`
   Make sure a template file or a directory exists at`),
        generateErrorLog(source, "bold"),
        generateErrorLog(
          `or change the source for ${module} module in the config file`
        )
      ];
      console.log(...logParts);
      return;
    }

    // Read file or directory from source
    const sourceStats = fs.statSync(source);

    let sourceType = sourceStats.isFile() ? sourceTypes.file : undefined;
    sourceType = sourceStats.isDirectory() ? sourceTypes.directory : undefined;

    if (sourceType === null) {
      console.log(
        generateErrorLog(
          `Template source should either be a file or a directory`
        ),
        generateErrorLog(`Make sure a template file or a directory exists at`),
        generateErrorLog(source, "bold"),
        generateErrorLog(
          `or change the source for ${module} module in the config file`
        )
      );
    }

    // Ensure destination exists
    if (!destination) {
      console.log(
        generateErrorLog(`Config for module`),
        generateErrorLog(module, "bold"),
        generateErrorLog(
          "is missing the destination config. Don't know where to generate your module"
        )
      );
    }

    const destinationExists = fs.existsSync(destination);
    if (!destinationExists) {
      console.log(
        generateWarnLog(`👩‍🔧 Destination directory does not exists at path`),
        generateWarnLog(destination, "bold"),
        generateWarnLog("Building it now")
      );
      try {
        fs.mkdirSync(destination);
      } catch (e) {
        console.log(
          generateErrorLog(`🤷‍♀️ Failed to create your destination directory.`),
          generateErrorLog(e.message)
        );
        return;
      }
    }

    // Hydrate source template
    if (sourceType === sourceTypes.file) {
      cloneFile(source, destination, flags);
    } else if (sourceType === sourceTypes.directory) {
      cloneDirectory(source, destination, flags).then(() => {
        console.log(chalk.green("👸🎤⤵️  Jen out"));
      });
    }
    // Clone hydrated template in the destination
  } catch (e) {
    console.log(generateErrorLog(e.message));
  }
};

export default run;
