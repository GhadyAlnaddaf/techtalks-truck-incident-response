import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  LOGIN_FIELDS,
  toLoginPayload,
  validateLogin,
} from "./loginValidation.js";

describe("validateLogin", () => {
  test("returns an empty object when both fields are filled in", () => {
    assert.deepEqual(
      validateLogin({ identifier: "driver24", password: "secret" }),
      {},
    );
  });

  test("flags both fields when both are empty", () => {
    assert.deepEqual(validateLogin({ identifier: "", password: "" }), {
      identifier: "Enter your username or email.",
      password: "Enter your password.",
    });
  });

  test("treats a whitespace-only identifier as empty", () => {
    assert.deepEqual(validateLogin({ identifier: "   ", password: "secret" }), {
      identifier: "Enter your username or email.",
    });
  });

  test("flags only the password when only the password is empty", () => {
    assert.deepEqual(validateLogin({ identifier: "driver24", password: "" }), {
      password: "Enter your password.",
    });
  });

  test("does not trim the password, so spaces count as a value", () => {
    assert.deepEqual(
      validateLogin({ identifier: "driver24", password: "   " }),
      {},
    );
  });

  test("accepts any identifier: no email format check", () => {
    for (const identifier of ["driver24", "dispatch@example.com", "not@an"]) {
      assert.deepEqual(validateLogin({ identifier, password: "secret" }), {});
    }
  });

  test("has no password length rules", () => {
    assert.deepEqual(validateLogin({ identifier: "driver24", password: "a" }), {});
  });

  test("treats missing or non-string values as empty", () => {
    const bothMissing = {
      identifier: "Enter your username or email.",
      password: "Enter your password.",
    };

    assert.deepEqual(validateLogin({}), bothMissing);
    assert.deepEqual(validateLogin(undefined), bothMissing);
    assert.deepEqual(
      validateLogin({ identifier: null, password: null }),
      bothMissing,
    );
  });
});

describe("LOGIN_FIELDS", () => {
  test("lists the fields in form order, so the first invalid one is focused", () => {
    assert.deepEqual(LOGIN_FIELDS, ["identifier", "password"]);
  });
});

describe("toLoginPayload", () => {
  test("trims the identifier and leaves the password untouched", () => {
    assert.deepEqual(
      toLoginPayload({ identifier: "  driver24  ", password: "  secret  " }),
      { identifier: "driver24", password: "  secret  " },
    );
  });

  test("returns only the two credential fields", () => {
    assert.deepEqual(
      toLoginPayload({ identifier: "a", password: "b", extra: "c" }),
      { identifier: "a", password: "b" },
    );
  });
});
