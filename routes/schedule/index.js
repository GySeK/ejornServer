"use strict"
require("dotenv").config()
const { Pool, Client } = require("pg")
const checkReqToken = require("../../modules/checkReqToken")
const getProperty = require("../../modules/getProperty")
const getReqTokenData = require("../../modules/getReqTokenData")

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    try {
      return "zalupas"
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply, ["pupil"])
    })

    instance.get("/get/pupil/schedule", async function (request, reply) {
      try {
        const login = getReqTokenData(request, reply)
        const date = getProperty(request.query, "date")

        const pool = new Pool()
        const res = await pool.query(
          `select * from lessons where group_id=(select group_id from pupils where login=$1) and date=$2`,
          [login, date]
        )
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    done()
  })

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply, ["scheduler"])
    })

    instance.get("/get/scheduler/schedule", async function (request, reply) {
      try {
        const group_id = getProperty(request.query, "group_id")
        const date = getProperty(request.query, "date")

        const pool = new Pool()
        const res = await pool.query(
          `select * from lessons where group_id=$1 and date=$2`,
          [group_id, date]
        )
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.post("/post/schedule", async (request, reply) => {
      try {
        const date = getProperty(request.body, "t_login")
        const group_id = getProperty(request.body, "group_id")
        const t_logins = getProperty(request.body, "t_logins")
        const subject_ids = getProperty(request.body, "subject_ids")

        if (subject_ids.constructor !== Array)
          throw new Error("У вас group_ids не массив")

        if (t_logins.constructor !== Array)
          throw new Error("У вас t_logins не массив")

        if(t_logins.length != subject_ids.length)
          throw new Error("Аааааа блять кол-во элементов массивов t_logins и subject_ids не совпадают")

        const pool = new Pool()
        await pool.query(
          "insert into lessons(date, group_id, subject_id, t_login) values($1, $2, unnest($3), unnest($4))",
          [date, group_id, subject_ids, t_logins]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/schedule", async (request, reply) => {
      try {
        const date = getProperty(request.body, "date")

        const pool = new Pool()
        await pool.query("delete from lessons where date=$1", [date])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    done()
  })
}
