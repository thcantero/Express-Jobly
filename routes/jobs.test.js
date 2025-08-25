"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
  const newJob = { title: "New Job", salary: 50000, equity: 0.1, companyHandle: "c1" };

  test("works for admin", async function () {
    const newJob = {
      title: "New Job",
      salary: 50000,
      equity: 0.1,  
      companyHandle: "c1"
    };
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 50000,
        equity: "0.1",  
        companyHandle: "c1"
      }
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({ title: "New Job", salary: 50000 })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({ ...newJob, equity: "not-a-number" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */
describe("GET /jobs", function () {
  test("works for anon", async function () {
  const resp = await request(app).get('/jobs');

  console.log(resp.body.jobs[0])

  expect(resp.body.jobs[0]).toEqual({
    id: jobIds[0],
    title: "j1",
    salary: 100000,
    equity: "0.1",
    companyHandle: "c1",
  });
});

  test("works with filters", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 150000, hasEquity: true });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs.length).toEqual(1);
    expect(resp.body.jobs[0].title).toEqual("j3");
  });

  test("bad request with invalid filter", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: "not-a-number" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */
describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body.jobs[0]).toEqual({
      id: jobIds[0],
      title: "j1",
      salary: 100000,
      equity: "0.1",
      companyHandle: "c1",
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get("/jobs/0");
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */
describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const jobsResp = await request(app).get("/jobs");
    const jobId = jobsResp.body.jobs[0].id;
    
    const resp = await request(app)
    .patch(`/jobs/${jobId}`)
    .send({ title: "Updated Job" })
    .set("authorization", `Bearer ${adminToken}`);
  expect(resp.body.job.title).toEqual("Updated Job");
});

  test("unauth for non-admin", async function () {
    const jobsResp = await request(app).get("/jobs");
    const jobId = jobsResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({ title: "Updated Job" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .patch("/jobs/0")
      .send({ title: "nope" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const jobsResp = await request(app).get("/jobs");
    const jobId = jobsResp.body.jobs[0].id;

    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({ salary: "not-a-number" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */
describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const jobsResp = await request(app).get("/jobs");
    const jobId = jobsResp.body.jobs[0].id;

    const resp = await request(app)
    .delete(`/jobs/${jobId}`)
    .set("authorization", `Bearer ${adminToken}`);
  expect(resp.body).toEqual({ deleted: jobId });
});

  test("unauth for non-admin", async function () {
    const jobsResp = await request(app).get("/jobs");
    const jobId = jobsResp.body.jobs[0].id;

    const resp = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete("/jobs/0")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
