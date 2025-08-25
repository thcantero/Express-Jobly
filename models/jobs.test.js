"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Job Model", () => {
  describe("create", () => {
    test("works", async () => {
      const job = await Job.create({
        title: "New Job",
        salary: 100000,
        equity: 0.1,
        companyHandle: "c1"
      });
      expect(job).toEqual({
        id: expect.any(Number),
        title: "New Job",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
      });
    });
  });

  describe("findAll", () => {
    test("works: no filter", async () => {
      const jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 80000,
          equity: "0",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        }
      ]);
    });

    test("works: title filter", async () => {
      const jobs = await Job.findAll({ title: "j1" });
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }
      ]);
    });

    test("works: minSalary filter", async () => {
      const jobs = await Job.findAll({ minSalary: 100000 });
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        }
      ]);
    });

    test("works: hasEquity filter", async () => {
      const jobs = await Job.findAll({ hasEquity: true });
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        }
      ]);
    });

    test("works: all filters", async () => {
      const jobs = await Job.findAll({
        title: "j",
        minSalary: 100000,
        hasEquity: true
      });
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        }
      ]);
    });
  });

  describe("get", () => {
    test("works", async () => {
      // First get a job ID from the database
      const jobsRes = await db.query("SELECT id FROM jobs WHERE title = 'j1'");
      const jobId = jobsRes.rows[0].id;

      const job = await Job.get(jobId);
      expect(job).toEqual({
        id: jobId,
        title: "j1",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
      });
    });

    test("not found if no such job", async () => {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

  describe("update", () => {
    const updateData = {
      title: "Updated",
      salary: 120000,
      equity: 0.15
    };

    test("works", async () => {
      const jobsRes = await db.query("SELECT id FROM jobs WHERE title = 'j1'");
      const jobId = jobsRes.rows[0].id;

      const job = await Job.update(jobId, updateData);
      expect(job).toEqual({
        id: jobId,
        ...updateData,
        equity: "0.15",
        companyHandle: "c1"
      });
    });

    test("not found if no such job", async () => {
      try {
        await Job.update(0, updateData);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    test("bad request with companyHandle", async () => {
      try {
        await Job.update(jobIds[0], { companyHandle: "invalid" });
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

  describe("remove", () => {
    test("works", async () => {
      const jobsRes = await db.query("SELECT id FROM jobs WHERE title = 'j1'");
      const jobId = jobsRes.rows[0].id;

      await Job.remove(jobId);
      const res = await db.query(`SELECT id FROM jobs WHERE id=$1`, [jobId]);
      expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async () => {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
});