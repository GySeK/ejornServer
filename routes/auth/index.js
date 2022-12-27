"use strict"
require("dotenv").config()
const checkReqToken = require("../../modules/checkReqToken")
const jwt = require("jsonwebtoken")
const argon2 = require("argon2")
const getProperty = require("../../modules/getProperty")
const getReqTokenData = require("../../modules/getReqTokenData")
const { Pool, Client } = require("pg")

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    try {
      return "zalupas"
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/token", async function (request, reply) {
    try {
      const login = getProperty(request.query, "login")
      const password = getProperty(request.query, "password")

      const pool = new Pool()
      const res = await pool.query("select * from users where login = $1", [
        login,
      ])
      await pool.end()
      if (res.rowCount == 0) return null

      if (!(await argon2.verify(res.rows[0].password, password))) return null
      return jwt.sign({ login }, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/token/check/fast", async function (request, reply) {
    try {
      const token = getProperty(request.query, "token")
      return jwt.verify(token, process.env.JWT_SECRET) ? true : false
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  fastify.get("/get/user/roles", async function (request, reply) {
    try {
      const login = getReqTokenData(request, reply)

      const pool = new Pool()
      const res = await pool.query("select roles from users where login=$1", [
        login,
      ])
      await pool.end()

      return res.rows
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })
}
