import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  DEPENDENT_FIELDS,
  REGISTER_FIELDS,
  toRegisterPayload,
  validateRegister,
  validateRegisterField,
} from "./registerValidation.js";

const VALID = {
  username: "driver24",
  email: "sam@example.com",
  password: "open-road-77",
  confirmPassword: "open-road-77",
};

const passwordError = (password, overrides = {}) =>
  validateRegisterField("password", { ...VALID, ...overrides, password });

describe("validateRegister", () => {
  test("returns an empty object when every field is valid", () => {
    assert.deepEqual(validateRegister(VALID), {});
  });

  test("flags all four fields when the form is empty", () => {
    assert.deepEqual(
      validateRegister({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      }),
      {
        username: "Enter a username.",
        email: "Enter your email address.",
        password: "Enter a password.",
        confirmPassword: "Confirm your password.",
      },
    );
  });

  test("treats missing or non-string values as empty", () => {
    const allMissing = {
      username: "Enter a username.",
      email: "Enter your email address.",
      password: "Enter a password.",
      confirmPassword: "Confirm your password.",
    };

    assert.deepEqual(validateRegister({}), allMissing);
    assert.deepEqual(validateRegister(undefined), allMissing);
    assert.deepEqual(
      validateRegister({
        username: null,
        email: null,
        password: null,
        confirmPassword: null,
      }),
      allMissing,
    );
  });
});

describe("username", () => {
  test("treats a whitespace-only username as empty", () => {
    assert.equal(
      validateRegisterField("username", { ...VALID, username: "   " }),
      "Enter a username.",
    );
  });
});

describe("email", () => {
  test("accepts ordinary addresses, ignoring surrounding spaces", () => {
    for (const email of [
      "sam@example.com",
      "sam.driver+tir@mail.example.co",
      "  sam@example.com  ",
    ]) {
      assert.equal(validateRegisterField("email", { ...VALID, email }), "");
    }
  });

  test("rejects anything that is not an address", () => {
    for (const email of [
      "sam",
      "sam@",
      "@example.com",
      "sam@example",
      "sam@@example.com",
      "sam smith@example.com",
    ]) {
      assert.equal(
        validateRegisterField("email", { ...VALID, email }),
        "Enter a valid email address.",
        email,
      );
    }
  });
});

describe("password", () => {
  test("is required, and spaces count as a value", () => {
    assert.equal(passwordError(""), "Enter a password.");
    assert.notEqual(passwordError("   "), "Enter a password.");
  });

  test("must be at least 8 characters", () => {
    assert.equal(
      passwordError("abc-123"),
      "Password must be at least 8 characters.",
    );
    assert.equal(passwordError("abc-1234"), "");
  });

  test("counts an emoji as one character, as the server does", () => {
    assert.equal(
      passwordError("abcdef🚚"),
      "Password must be at least 8 characters.",
    );
    assert.equal(passwordError("abcdefg🚚"), "");
  });

  test("cannot be only numbers", () => {
    assert.equal(passwordError("12345678"), "Password cannot be only numbers.");
    assert.equal(passwordError("1234567a"), "");
  });

  test("cannot contain the username, whatever the case", () => {
    assert.equal(
      passwordError("xxDRIVER24xx"),
      "Password cannot contain your username.",
    );
    assert.equal(
      passwordError("xxdriver24xx", { username: "  Driver24  " }),
      "Password cannot contain your username.",
    );
  });

  test("cannot contain the part of the email before the @", () => {
    assert.equal(
      passwordError("my-SAM-password"),
      "Password cannot contain the part of your email before the @.",
    );
  });

  test("is not checked against the rest of the email", () => {
    assert.equal(passwordError("example.com-77"), "");
  });

  test("is not checked against an empty username or email", () => {
    assert.equal(passwordError("open-road-77", { username: "" }), "");
    assert.equal(passwordError("open-road-77", { username: "   " }), "");
    assert.equal(passwordError("open-road-77", { email: "" }), "");
    assert.equal(passwordError("open-road-77", { email: "@example.com" }), "");
    assert.equal(passwordError("open-road-77", { email: "no-at-sign" }), "");
  });

  test("reports one rule at a time, in a fixed order", () => {
    // Too short, numeric and containing the username all at once.
    assert.equal(
      passwordError("1234", { username: "1234" }),
      "Password must be at least 8 characters.",
    );
    assert.equal(
      passwordError("12345678", { username: "12345678" }),
      "Password cannot be only numbers.",
    );
  });
});

describe("confirm password", () => {
  const confirmError = (password, confirmPassword) =>
    validateRegisterField("confirmPassword", {
      ...VALID,
      password,
      confirmPassword,
    });

  test("is required", () => {
    assert.equal(confirmError("open-road-77", ""), "Confirm your password.");
  });

  test("must match the password exactly", () => {
    assert.equal(confirmError("open-road-77", "open-road-77"), "");

    for (const confirmPassword of [
      "open-road-78",
      "Open-Road-77",
      "open-road-77 ",
    ]) {
      assert.equal(
        confirmError("open-road-77", confirmPassword),
        "Passwords do not match.",
      );
    }
  });
});

describe("REGISTER_FIELDS", () => {
  test("lists the fields in form order, so the first invalid one is focused", () => {
    assert.deepEqual(REGISTER_FIELDS, [
      "username",
      "email",
      "password",
      "confirmPassword",
    ]);
  });
});

describe("DEPENDENT_FIELDS", () => {
  test("has an entry for every field", () => {
    assert.deepEqual(Object.keys(DEPENDENT_FIELDS).sort(), [
      ...REGISTER_FIELDS,
    ].sort());
  });
});

describe("toRegisterPayload", () => {
  test("trims the username and email and leaves the password untouched", () => {
    assert.deepEqual(
      toRegisterPayload({
        username: "  driver24  ",
        email: "  sam@example.com  ",
        password: "  open road  ",
        confirmPassword: "  open road  ",
      }),
      {
        username: "driver24",
        email: "sam@example.com",
        password: "  open road  ",
      },
    );
  });

  test("never includes the confirmation or a role", () => {
    assert.deepEqual(
      Object.keys(
        toRegisterPayload({ ...VALID, role: "Dispatcher", extra: "x" }),
      ),
      ["username", "email", "password"],
    );
  });
});
