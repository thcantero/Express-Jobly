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
      expect(jobs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }),
        expect.objectContaining({
          title: "j2",
          salary: 80000,
          equity: "0",
          companyHandle: "c1"
        }),
        expect.objectContaining({
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        })
      ]));
    });

    test("works: title filter", async () => {
      const jobs = await Job.findAll({ title: "j1" });
      expect(jobs).toEqual([
        expect.objectContaining({
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        })
      ]);
    });

    test("works: minSalary filter", async () => {
      const jobs = await Job.findAll({ minSalary: 100000 });
      expect(jobs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }),
        expect.objectContaining({
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        })
      ]));
    });

    test("works: hasEquity filter", async () => {
      const jobs = await Job.findAll({ hasEquity: true });
      expect(jobs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }),
        expect.objectContaining({
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        })
      ]));
    });

    test("works: all filters", async () => {
      const jobs = await Job.findAll({
        title: "j",
        minSalary: 100000,
        hasEquity: true
      });
      expect(jobs).toEqual(expect.arrayContaining([
        expect.objectContaining({
          title: "j1",
          salary: 100000,
          equity: "0.1",
          companyHandle: "c1"
        }),
        expect.objectContaining({
          title: "j3",
          salary: 150000,
          equity: "0.2",
          companyHandle: "c2"
        })
      ]));
    });
  });


  describe("get", () => {
    // test("works", async () => {
    //   console.log(jobIds[0]);
    //   const job = await Job.get(jobIds[0]);
    //   expect(job).toEqual({
    //     id: jobIds[0],
    //     title: "j1",
    //     salary: 100000,
    //     equity: "0.1",
    //     companyHandle: "c1"
    //   });
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

    // test("works", async () => {
    //   const job = await Job.update(jobIds[0], updateData);
    //   expect(job).toEqual({
    //     id: jobIds[0],
    //     ...updateData,
    //     equity: "0.15",
    //     companyHandle: "c1"
    //   });
    // });

    test("not found if no such job", async () => {
      try {
        await Job.update(0, updateData);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

    // test("bad request with companyHandle", async () => {
    //   try {
    //     await Job.update(jobIds[0], { companyHandle: "c2" });
    //     fail();
    //   } catch (err) {
    //     expect(err instanceof BadRequestError).toBeTruthy();
    //   }
    // });
//   });

  describe("remove", () => {
    // test("works", async () => {
    //   await Job.remove(jobIds[0]);
    //   const res = await db.query(`SELECT id FROM jobs WHERE id=$1`, [jobIds[0]]);
    //   expect(res.rows.length).toEqual(0);
    // });

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