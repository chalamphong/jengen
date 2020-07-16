import { hydrate } from "../";

test("hydrate replaces placeholder with value", () => {
  const template = "Hey, it's __name__";
  const context = {
    name: "John"
  };
  const expected = "Hey, it's John";

  expect(hydrate(template, context)).toBe(expected);
});

test("hydrate replaces multiple instances of the same placeholder with value", () => {
  const template = "Hey, it's __name__. Hi __name__, I'm not __name__";
  const context = {
    name: "John"
  };
  const expected = "Hey, it's John. Hi John, I'm not John";

  expect(hydrate(template, context)).toBe(expected);
});

test("hydrate replaces multiple instances of the multiple placeholder with value", () => {
  const template =
    "Hey, it's __name__. Hi __name__, Whats your surname? Its __surname__";
  const context = {
    name: "John",
    surname: "Goat"
  };
  const expected = "Hey, it's John. Hi John, Whats your surname? Its Goat";

  expect(hydrate(template, context)).toBe(expected);
});

test("throws if template is not a string", () => {
  const expectedError = "Cannot hydrate because template is not a string";
  expect(() => hydrate()).toThrow(expectedError);
});

test("throws if template is not a string", () => {
  const expectedError = "Cannot hydrate because context is not an object";
  expect(() => hydrate("template")).toThrow(expectedError);
  expect(() => hydrate("template", "too")).toThrow(expectedError);
  expect(() => hydrate("template", [])).toThrow(expectedError);
  expect(() => hydrate("template", null)).toThrow(expectedError);
  expect(() => hydrate("template", () => {})).toThrow(expectedError);
});
