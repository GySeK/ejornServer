require("dotenv").config()
const { Client, Pool } = require("pg")

try {
  ;(async function () {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      database: "postgres",
      password: process.env.PGPASSWORD,
    })

    await pool.query(`drop database if exists ${process.env.PGDATABASE}`)
    await pool.query(`create database ${process.env.PGDATABASE}`)

    pool.end()
    console.log("База данных создана")
  })()
} catch (err) {
  console.error(err)
}
