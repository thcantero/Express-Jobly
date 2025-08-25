const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const Job = require("../models/jobs.js"); // Import Job model

let jobIds = []; // Array to store job IDs

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM applications");
  await db.query("DELETE FROM jobs");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);

  // Create jobs and store their IDs
  const jobsRes = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('j1', 100000, 0.1, 'c1'),
           ('j2', 80000, 0, 'c1'),
           ('j3', 150000, 0.2, 'c2')
    RETURNING id`
  );

  jobIds = jobsRes.rows.map(r => r.id);

  // Create application
  await db.query(`
    INSERT INTO applications (username, job_id)
    VALUES ('u1', $1)`,
    [jobIds[0]]
  );

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
};