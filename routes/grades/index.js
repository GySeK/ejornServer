"use strict"
require("dotenv").config()
const { Pool, Client } = require("pg")
const checkReqToken = require("../../modules/checkReqToken")
const getProperty = require("../../modules/getProperty")

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
      await checkReqToken(request, reply, ["teacher"])
    })

    instance.post("/post/grade", async (request, reply) => {
      try {
        const t_login = getReqTokenData(request, reply)
        const p_login = getProperty(request.body, "p_login")
        const lesson_id = getProperty(request.body, "lesson_id")
        const grade = getProperty(request.body, "grade")

        const pool = new Pool()
        const res = await pool.query(
          `select exists(select 1 from lesssons where lesson_id=$1 and t_login=$2)`,
          [lesson_id, t_login]
        )

        if (!res.rows[0].exsists)
          throw new Error(
            "Это не твой урок чтобы ставить оценку, зла на вас не хватает"
          )

        await pool.query(
          "insert into grades(lesson_id, grade, p_login) values($1, $2, $3)",
          [lesson_id, grade, p_login]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/grade", async (request, reply) => {
      try {
        const t_login = getReqTokenData(request, reply)
        const grade_id = getProperty(request.body, "grade_id")

        const pool = new Pool()
        const res = await pool.query(
          `select exists(
            select 1 from grades
            join lessons on grades.lesson_id=lessons.lesson_id
            where lessons.t_login=$1 and grades.grade_id=$2)`,
          [t_login, grade_id]
        )

        if (!res.rows[0].exsists) throw new Error("Ты пидр")

        await pool.query("delete from grades where grade_id=$1", [grade_id])
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/grade", async (request, reply) => {
      try {
        const grade = getProperty(request.body, "grade")
        const t_login = getReqTokenData(request, reply)
        const grade_id = getProperty(request.body, "grade_id")

        const pool = new Pool()
        const res = await pool.query(
          `select exists(
            select 1 from grades
            join lessons on grades.lesson_id=lessons.lesson_id
            where lessons.t_login=$1 and grades.grade_id=$2)`,
          [t_login, grade_id]
        )

        if (!res.rows[0].exsists) throw new Error("Ты пидр")

        await pool.query(
          "update grades set grade=$1 where grade_id=$2",
          [grade, grade_id]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.post("/post/fin_grade", async (request, reply) => {
      try {
        const t_login = getReqTokenData(request, reply)
        const p_login = getProperty(request.body, "p_login")
        const grade = getProperty(request.body, "grade")
        const grade_num = getProperty(request.body, "grade_num")
        const subject_id = getProperty(request.body, "subject_id")
        const start_year = getProperty(request.body, "start_year")
        const group_id = getProperty(request.body, "group_id")

        const pool = new Pool()
        const res1 = await pool.query(
          `select exists(select 1 from tsg
            where login=$1 and subject_id=$2 and group_id=$3)`,
          [t_login, subject_id, group_id]
        )

        if (!res1.rows[0].exsists)
          throw new Error(
            "Либо нет такого учителя либо у него нет такого предмета или группы"
          )

        const res2 = await pool.query(
          `select exists(select 1 from pupil
              where login=$1 and group_id=$2)`,
          [t_login, group_id]
        )

        if (!res2.rows[0].exsists)
          throw new Error("Нет ученика либо у него другая группа")

        await pool.query(
          `insert into fin_grades(subject_id, p_login, t_login, group_id, start_year, grade, grade_num) 
          values($1, $2, $3, $4, $5, $6, $7)`,
          [subject_id, p_login, t_login, group_id, start_year, grade, grade_num]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.delete("/delete/fin_grade", async (request, reply) => {
      try {
        const p_login = getProperty(request.body, "p_login")
        const start_year = getProperty(request.body, "start_year")
        const grade_num = getProperty(request.body, "grade_num")
        const t_login = getReqTokenData(request, reply)

        const pool = new Pool()
        const res = await pool.query(
          `select exists(select 1 from fin_grades as f
            join tsg on tsg.login=f.t_login
            where login=$1)`,
          [t_login]
        )

        if (!res.rows[0].exsists)
          throw new Error("Не ты блять ставил эту оценку чтобы ее менять, олух")

        await pool.query(
          "delete from fin_grades where p_login=$1 and start_year=$2 and grade_num=$3",
          [p_login, start_year, grade_num]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.put("/put/fin_grade", async (request, reply) => {
      try {
        const p_login = getProperty(request.body, "p_login")
        const start_year = getProperty(request.body, "start_year")
        const grade_num = getProperty(request.body, "grade_num")
        const grade = getProperty(request.body, "grade")
        const t_login = getReqTokenData(request, reply)

        const pool = new Pool()
        const res = await pool.query(
          `select exists(select 1 from fin_grades as f
            join tsg on tsg.login=f.t_login
            where login=$1)`,
          [t_login]
        )

        if (!res.rows[0].exsists)
          throw new Error("Не ты блять ставил эту оценку чтобы ее менять, олух")

        await pool.query(
          "update fin_grades set grade=$1 where start_year=$2 and grade_num=$3 and p_login=$4",
          [grade, start_year, grade_num, p_login]
        )
        await pool.end()

        return null
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.get("/get/teacher/grades", async function (request, reply) {
      try {
        const t_login = getProperty(request.body, "t_login")
        const subject_id = getProperty(request.query, "subject_id")

        const pool = new Pool()
        const res = await pool.query(
          `select g.* from grades as g
          join lessons as l on g.lesson_id=l.lesson_id
          where l.t_login=$1 and l.subject_id=$2`,
          [p_login, subject_id]
        )
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.get("/get/teacher/fin_grades", async function (request, reply) {
      try {
        const t_login = getProperty(request.body, "t_login")
        const subject_id = getProperty(request.query, "subject_id")
        const start_year = getProperty(request.query, "start_year")

        const pool = new Pool()
        const res = await pool.query(
          `select * from fin_grades
          where subject_id=$1 and t_login=$2 and start_year=$3`,
          [subject_id, t_login, start_year]
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
      await checkReqToken(request, reply, ["pupil"])
    })

    instance.get("/get/pupil/grades", async function (request, reply) {
      try {
        const p_login = getProperty(request.body, "p_login")
        const subject_id = getProperty(request.query, "subject_id")

        const pool = new Pool()
        const res = await pool.query(
          `select g.* from grades as g
          join lessons as l on g.lesson_id=l.lesson_id
          where g.p_login=$1 and l.subject_id=$2`,
          [p_login, subject_id]
        )
        await pool.end()

        return res.rows
      } catch (err) {
        console.log(err)
        reply.code(500).send(err.message)
      }
    })

    instance.get("/get/pupil/fin_grades", async function (request, reply) {
      try {
        const p_login = getProperty(request.body, "p_login")
        const subject_id = getProperty(request.query, "subject_id")
        const start_year = getProperty(request.query, "start_year")

        const pool = new Pool()
        const res = await pool.query(
          `select * from fin_grades
          where subject_id=$1 and p_login=$2 and start_year=$3`,
          [subject_id, p_login, start_year]
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
}
