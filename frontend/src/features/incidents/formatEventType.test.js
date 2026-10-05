import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { formatEventType } from "./formatEventType.js";

describe("formatEventType", () => {
  test("labels each event type the backend records", () => {
    assert.equal(formatEventType("CREATED"), "Created");
    assert.equal(formatEventType("STATUS_CHANGED"), "Status changed");
    assert.equal(formatEventType("ASSISTANCE_ASSIGNED"), "Assistance assigned");
  });

  test("tolerates case and surrounding spaces on known types", () => {
    assert.equal(formatEventType(" status_changed "), "Status changed");
  });

  test("turns an unknown type into readable sentence case", () => {
    assert.equal(formatEventType("PHOTO_ADDED"), "Photo added");
    assert.equal(formatEventType("resolution_recorded"), "Resolution recorded");
    assert.equal(formatEventType("NOTE"), "Note");
  });

  test("collapses repeated or edge underscores in an unknown type", () => {
    assert.equal(formatEventType("_PHOTO__ADDED_"), "Photo added");
  });

  test("returns an empty string for a missing type", () => {
    assert.equal(formatEventType(undefined), "");
    assert.equal(formatEventType(null), "");
    assert.equal(formatEventType(""), "");
    assert.equal(formatEventType("   "), "");
  });
});
