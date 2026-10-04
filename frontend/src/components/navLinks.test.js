import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { ROLES } from "../features/auth/roles.js";
import { getNavLinks } from "./navLinks.js";

describe("getNavLinks", () => {
  test("gives a truck driver incident reporting only", () => {
    assert.deepEqual(getNavLinks(ROLES.TRUCK_DRIVER), [
      { path: "/", label: "Report Incident", icon: "report", end: true },
    ]);
  });

  test("gives a dispatcher the dashboard and the incident history", () => {
    assert.deepEqual(getNavLinks(ROLES.DISPATCHER), [
      { path: "/dispatcher", label: "Dashboard", icon: "dashboard" },
      { path: "/history", label: "History", icon: "history" },
    ]);
  });

  test("returns an empty list for a missing role", () => {
    assert.deepEqual(getNavLinks(), []);
    assert.deepEqual(getNavLinks(null), []);
    assert.deepEqual(getNavLinks(""), []);
  });

  test("returns an empty list for an unknown role", () => {
    assert.deepEqual(getNavLinks("admin"), []);
  });

  test("matches the stored values exactly, so case differences are unknown", () => {
    assert.deepEqual(getNavLinks("Dispatcher"), []);
    assert.deepEqual(getNavLinks("TRUCK_DRIVER"), []);
  });

  test("does not treat built-in object keys as roles", () => {
    for (const key of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
      assert.deepEqual(getNavLinks(key), [], key);
    }
  });

  test("returns a fresh copy, so a caller cannot change the next result", () => {
    const first = getNavLinks(ROLES.DISPATCHER);
    first.pop();
    first[0].label = "Changed";

    assert.deepEqual(getNavLinks(ROLES.DISPATCHER), [
      { path: "/dispatcher", label: "Dashboard", icon: "dashboard" },
      { path: "/history", label: "History", icon: "history" },
    ]);
  });
});
