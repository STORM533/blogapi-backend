import request from "supertest";
import app from "../../src/app.js";

// SuperTest against the exported Express app — no app.listen(), per the
// routes-testing notes: the server entry (src/server.ts) is never imported.
const api = request(app);

export default api;
