// models/job.js
"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  /** Create a job (from data), return new job data. */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
       (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    return result.rows[0];
  }

  /** Find all jobs with optional filtering. */
  static async findAll({ title, minSalary, hasEquity } = {}) {
    let query = `SELECT id, title, salary, equity, company_handle AS "companyHandle"
                 FROM jobs`;
    let where = [];
    let values = [];

    if (title !== undefined) {
      values.push(`%${title}%`);
      where.push(`title ILIKE $${values.length}`);
    }

    if (minSalary !== undefined) {
      values.push(minSalary);
      where.push(`salary >= $${values.length}`);
    }

    if (hasEquity === true) {
      where.push(`equity::float > 0`);
    }

    if (where.length > 0) {
      query += " WHERE " + where.join(" AND ");
    }

    query += " ORDER BY id";
    const jobsRes = await db.query(query, values);
    return jobsRes.rows;
  }

  /** Get job by id. */
  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs WHERE id = $1`,
      [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  /** Update job data. */
  static async update(id, data) {
    if (data.companyHandle) {
      throw new BadRequestError("Not allowed to change company handle");
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
    });
    const jobIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${jobIdVarIdx} 
                      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  /** Delete job. */
  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`, [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
