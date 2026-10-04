import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { filterByStatus, getStatusOptions } from "./incidentStatusFilter.js";

const incident = (id, status) => ({ id, status });

describe("getStatusOptions", () => {
  test("lists each status in the data once, in workflow order", () => {
    const incidents = [
      incident(1, "Resolved"),
      incident(2, "Pending"),
      incident(3, "In progress"),
      incident(4, "Pending"),
      incident(5, "Assigned"),
      incident(6, "On the way"),
    ];

    assert.deepEqual(getStatusOptions(incidents), [
      "Pending",
      "Assigned",
      "On the way",
      "In progress",
      "Resolved",
    ]);
  });

  test("only offers statuses that are present, so no option is ever empty", () => {
    assert.deepEqual(
      getStatusOptions([incident(1, "Resolved"), incident(2, "Pending")]),
      ["Pending", "Resolved"],
    );
  });

  test("treats case and spacing differences as one status, tidying the first spelling", () => {
    assert.deepEqual(
      getStatusOptions([
        incident(1, " pending "),
        incident(2, "Pending"),
        incident(3, "On  the way"),
        incident(4, "on the way"),
      ]),
      ["pending", "On the way"],
    );
  });

  test("puts statuses outside the workflow after it, alphabetically", () => {
    assert.deepEqual(
      getStatusOptions([
        incident(1, "Rejected"),
        incident(2, "Pending"),
        incident(3, "Cancelled"),
      ]),
      ["Pending", "Cancelled", "Rejected"],
    );
  });

  test("ignores missing or blank statuses", () => {
    assert.deepEqual(
      getStatusOptions([
        incident(1, ""),
        incident(2, "   "),
        incident(3, null),
        { id: 4 },
        incident(5, "Assigned"),
      ]),
      ["Assigned"],
    );
  });

  test("returns an empty list for no incidents or a non-list", () => {
    assert.deepEqual(getStatusOptions([]), []);
    assert.deepEqual(getStatusOptions(undefined), []);
    assert.deepEqual(getStatusOptions(null), []);
  });
});

describe("filterByStatus", () => {
  const incidents = [
    incident(1, "Pending"),
    incident(2, "Resolved"),
    incident(3, " pending"),
    incident(4, "On the way"),
  ];

  test("returns every incident when no status is chosen", () => {
    assert.deepEqual(filterByStatus(incidents, ""), incidents);
    assert.deepEqual(filterByStatus(incidents, null), incidents);
    assert.deepEqual(filterByStatus(incidents, undefined), incidents);
  });

  test("keeps only incidents with the chosen status", () => {
    assert.deepEqual(
      filterByStatus(incidents, "Resolved").map((i) => i.id),
      [2],
    );
  });

  test("matches case and spacing differences, like the status badge", () => {
    assert.deepEqual(
      filterByStatus(incidents, "pending").map((i) => i.id),
      [1, 3],
    );
    assert.deepEqual(
      filterByStatus(incidents, "on  THE way").map((i) => i.id),
      [4],
    );
  });

  test("never shows a Pending incident under Resolved", () => {
    assert.ok(
      filterByStatus(incidents, "Resolved").every((i) => i.status === "Resolved"),
    );
  });

  test("returns an empty list when nothing matches", () => {
    assert.deepEqual(filterByStatus(incidents, "Assigned"), []);
  });

  test("does not change the list it is given", () => {
    const copy = structuredClone(incidents);
    filterByStatus(incidents, "Pending");
    assert.deepEqual(incidents, copy);
  });

  test("returns an empty list for a non-list", () => {
    assert.deepEqual(filterByStatus(undefined, "Pending"), []);
  });
});
