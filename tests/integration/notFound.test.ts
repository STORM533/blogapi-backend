import { beforeEach, describe, expect, it } from "vitest";
import api from "../helpers/api.js";
import { resetDb } from "../helpers/db.js";

describe("404 catch-all", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns 404 for an unknown GET route", async () => {
    const res = await api.get("/definitely-not-a-route");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });

  it("returns 404 for an unknown nested route", async () => {
    const res = await api.get("/posts/1/unknown-subresource");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });

  it("returns 404 for an unknown POST route", async () => {
    const res = await api.post("/nothing-here").send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });

  it("returns 404 for a method that is not defined on a known path", async () => {
    const res = await api.put("/auth/login").send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found" });
  });
});
