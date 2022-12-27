"use strict"
require("dotenv").config()
const { Pool, Client } = require("pg")
const checkReqToken = require("../../modules/checkReqToken")
const jwt = require("jsonwebtoken")
const argon2 = require("argon2")
const getProperty = require("../../modules/getProperty")
const checkRoles = require("../../modules/checkRoles")

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    try {
      return "zalupas"
    } catch (err) {
      console.log(err)
      reply.code(500).send(err.message)
    }
  })

  /*fastify.get("/get/token", async function (request, reply) {
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
  })*/

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply, ["admin"])
    })

    //Пользователь

    instance.get("/get/users", async function (request, reply) {
      try {
        const pool = new Pool()
        const res = await pool.query("select * from users", [])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.post("/post/user", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const name = getProperty(request.body, "name")
        const password = getProperty(request.body, "password")
        const roles = getProperty(request.body, "roles")

        checkRoles(roles)

        const pool = new Pool()
        await pool.query(
          "insert into users(login, password, name, roles) values($1, $2, $3, $4)",
          [login, await argon2.hash(password), name, roles]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/user", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")

        const pool = new Pool()
        const res = await pool.query("delete from users where login=$1", [
          login,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/user/name", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const new_name = getProperty(request.body, "new_name")

        const pool = new Pool()
        const res = await pool.query(
          "update users set name=$1 where login=$2",
          [new_name, login]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.post("/post/user/role", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const role = getProperty(request.body, "role")

        checkRoles(role)

        if (role.constructor === Array)
          throw new Error(
            "Читай название endpoint-а нельзя добавить больше 1 значения"
          )

        if (role == null)
          throw new Error(
            "Пидрила вставть себе в жопу свое NULL а в role строку"
          )

        const pool = new Pool()
        await pool.query(
          "update users set roles = array_append(roles, $1) where login = $2",
          [role, login]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/user/role", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const role = getProperty(request.body, "role")

        checkRoles(role)

        if (role.constructor === Array)
          throw new Error(
            "Читай название endpoint-а нельзя добавить больше 1 значения"
          )

        if (role == null)
          throw new Error(
            "Пидрила вставть себе в жопу свое NULL а в role строку"
          )

        const pool = new Pool()
        await pool.query(
          "update users set roles = array_remove(roles, $1) where login = $2",
          [role, login]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    //Группа

    /*instance.get("/get/groups", async function (request, reply) {
      try {
        const pool = new Pool()
        const res = await pool.query("select * from groups", [])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })*/

    instance.post("/post/group", async (request, reply) => {
      try {
        const name = getProperty(request.body, "name")

        const pool = new Pool()
        const res = await pool.query("insert into groups(name) values($1)", [
          name,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/group", async (request, reply) => {
      try {
        const group_id = getProperty(request.body, "group_id")

        const pool = new Pool()
        const res = await pool.query("delete from groups where group_id=$1", [
          group_id,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/group/name", async (request, reply) => {
      try {
        const group_id = getProperty(request.body, "group_id")
        const new_name = getProperty(request.body, "new_name")

        const pool = new Pool()
        const res = await pool.query(
          "update groups set name=$1 where group_id=$2",
          [new_name, group_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    //Предмет

    /*instance.get("/get/subjects", async function (request, reply) {
      try {
        const pool = new Pool()
        const res = await pool.query("select * from subjects", [])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })*/

    instance.post("/post/subject", async (request, reply) => {
      try {
        const name = getProperty(request.body, "name")

        const pool = new Pool()
        const res = await pool.query("insert into subject(name) values($1)", [
          subject,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/subject", async (request, reply) => {
      try {
        const subject_id = getProperty(request.body, "subject_id")

        const pool = new Pool()
        const res = await pool.query(
          "delete from subjects where subject_id=$1",
          [subject_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/subject/name", async (request, reply) => {
      try {
        const subject_id = getProperty(request.body, "subject_id")
        const new_name = getProperty(request.body, "new_name")

        const pool = new Pool()
        const res = await pool.query(
          "update subjects set name=$1 where group_id=$2",
          [new_name, subject_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    //Ученик

    instance.post("/post/pupil", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const name = getProperty(request.body, "name")
        const password = getProperty(request.body, "password")
        const group_id = getProperty(request.body, "group_id")

        const pool = new Pool()
        const trunc_err = await (async () => {
          const client = await pool.connect()
          try {
            await client.query("BEGIN")

            await client.query(
              "insert into users(login, password, name, roles) values($1, $2, $3, '{pupil}')",
              [login, await argon2.hash(password), name]
            )

            await client.query(
              "insert into pupils(login, group_id) values($1, $2)",
              [login, group_id]
            )

            await client.query("COMMIT")
          } catch (e) {
            await client.query("ROLLBACK")
            throw e
          } finally {
            client.release()
          }
        })().catch((e) => e)

        if (trunc_err) throw trunc_err

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/pupil/group", async (request, reply) => {
      try {
        const pupil_id = getProperty(request.body, "pupil_id")
        const group_id = getProperty(request.body, "group_id")

        const pool = new Pool()

        await pool.query("update pupils set group_id=$1 where pupil_id=$2", [
          group_id,
          pupil_id,
        ])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    //Учитель

    instance.post("/post/teacher", async (request, reply) => {
      try {
        const login = getProperty(request.body, "login")
        const name = getProperty(request.body, "name")
        const password = getProperty(request.body, "password")

        const pool = new Pool()

        await client.query(
          "insert into users(login, password, name, roles) values($1, $2, $3, '{teacher}')",
          [login, await argon2.hash(password), name]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    //tsg

    instance.post("/post/tsg", async (request, reply) => {
      try {
        const t_login = getProperty(request.body, "t_login")
        const group_id = getProperty(request.body, "group_id")
        const subject_id = getProperty(request.body, "subject_id")

        checkRoles(roles)

        const pool = new Pool()
        await pool.query(
          "insert into tsg(login, group_id, subject_id) values($1, $2, $3)",
          [t_login, group_id, subject_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/tsg/subject", async (request, reply) => {
      try {
        const subject_id = getProperty(request.body, "subject_id")

        const pool = new Pool()
        await pool.query("delete from tsg where subject_id=$1", [subject_id])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/tsg/group", async (request, reply) => {
      try {
        const group_id = getProperty(request.body, "group_id")

        const pool = new Pool()
        await pool.query("delete from tsg where group_id=$1", [group_id])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    done()
  })

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply, ["admin", "pupil", "teacher", "scheduler"])
    })

    instance.get("/get/teacher/info", async function (request, reply) {
      try {
        const login = getReqTokenData(request, reply)

        const pool = new Pool()
        const res = await pool.query("select * from tsg where login=$1", [login])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.get("/get/subjects", async function (request, reply) {
      try {
        const pool = new Pool()
        const res = await pool.query("select * from subjects", [])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.get("/get/groups", async function (request, reply) {
      try {
        const pool = new Pool()
        const res = await pool.query("select * from groups", [])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

  })

  fastify.register(async (instance, opts, done) => {
    instance.addHook("preHandler", async (request, reply) => {
      await checkReqToken(request, reply, ["admin", "pupil", "teacher"])
    })

    instance.get("/get/pupil/info", async function (request, reply) {
      try {
        const login = getReqTokenData(request, reply)

        const pool = new Pool()
        const res = await pool.query(`select * from tsg where group_id=
        (select group_id from pupils where login=$1)`, [login])
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })
  })
}
