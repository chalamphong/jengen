const hydrate = (template, context) => {
  if (typeof template !== "string") {
    throw new Error("Cannot hydrate because template is not a string");
  }

  if (!context || typeof context !== "object" || Array.isArray(context)) {
    throw new Error("Cannot hydrate because context is not an object");
  }

  let mutableTemplate = template;
  Object.keys(context).forEach(key => {
    const toReplace = `__${key}__`;
    mutableTemplate = mutableTemplate.split(toReplace).join(context[key]);
  });

  return mutableTemplate;
};

export { hydrate };
