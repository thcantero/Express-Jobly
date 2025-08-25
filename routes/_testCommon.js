"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/jobs");
const { createToken } = require("../helpers/tokens");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

let jobIds = [];

async function commonBeforeAll() {
  // Clear all tables
  await db.query("DELETE FROM applications");
  await db.query("DELETE FROM jobs");
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM companies");

  // Create companies
  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });

  // Create users
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "u1@email.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "u2@email.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@user.com",
    password: "password",
    isAdmin: true,
  });

  // Create jobs and store their IDs
  const job1 = await Job.create({
    title: "j1",
    salary: 100000,
    equity: 0.1,
    companyHandle: "c1"
  });
  
  const job2 = await Job.create({
    title: "j2",
    salary: 80000,
    equity: 0,
    companyHandle: "c1"
  });
  
  const job3 = await Job.create({
    title: "j3",
    salary: 150000,
    equity: 0.2,
    companyHandle: "c2"
  });

  // Clear and repopulate the jobIds array
  jobIds.length = 0;
  jobIds.push(job1.id, job2.id, job3.id);

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

const u1Token = createToken({ username: "u1", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds
};