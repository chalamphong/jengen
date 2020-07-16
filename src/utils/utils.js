const hydrate = (template, variables) => {
  let mutableTemplate = template;
  Object.keys(variables).forEach(variable => {
    const toReplace = `__${variable}__`;
    mutableTemplate = template.split(toReplace).join(variables[variable]);
  });

  return mutableTemplate;
};

export { hydrate };
