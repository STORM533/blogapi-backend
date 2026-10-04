import { beforeEach, describe, expect, it } from "vitest";
import api from "../helpers/api.js";
import { resetDb } from "../helpers/db.js";

describe("health", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("GET /health/live returns 200", async () => {
    const res = await api.get("/health/live");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /health/ready returns 200 when the database is reachable", async () => {
    const res = await api.get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
