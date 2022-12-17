require("dotenv").config()
const { Client, Pool } = require("pg")
const argon2 = require("argon2")

try {
  ;(async function () {
    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
    })

    const trunc_err = await (async () => {
      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        await client.query(
          `create table users (
            login character varying(15) primary key,
            password character varying(150) not null,
            name character varying(40) not null,
            roles character varying(20) [] not null
          )`
        )

        await client.query(
          "insert into users(login, password, name, roles) values($1, $2, $3, '{admin}')",
          ["admin", await argon2.hash(process.env.ADMIN_PASSWORD), "admin"]
        )

        await client.query(
          `create table groups (
            group_id serial primary key not null,
            name CHARACTER VARYING(30) not null
          )`
        )

        await client.query(
          `create table pupils (
            login character varying(15) not null primary key,
            group_id integer not null,
            FOREIGN KEY (group_id) REFERENCES groups (group_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (login) REFERENCES users (login) ON UPDATE CASCADE ON DELETE CASCADE
          )`
        )

        await client.query(
          `create table subjects(
            subject_id serial primary key,
            name CHARACTER VARYING(30) not null
          )`
        )

        await client.query(
          `create table tsg (
            login character varying(15) not null,
            group_id integer not null,
            subject_id integer not null,
            FOREIGN KEY (subject_id) REFERENCES subjects (subject_id) ON UPDATE CASCADE,
            FOREIGN KEY (group_id) REFERENCES groups (group_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (login) REFERENCES users (login) ON UPDATE CASCADE ON DELETE CASCADE,
            primary key(login, group_id, subject_id)
          )`
        )

        await client.query(
          `create table lessons (
            lesson_id integer not null primary key,
            t_login character varying(15) not null,
            subject_id integer not null,
            group_id integer not null,
            date date not null,
            FOREIGN KEY (t_login, group_id, subject_id) REFERENCES tsg (login, group_id, subject_id) ON UPDATE CASCADE
          )`
        )

        await client.query(
          `create table grades (
            grade_id serial primary key,
            lesson_id integer not null,
            grade character varying(5) not null,
            p_login character varying(15) not null,
            FOREIGN KEY (p_login) REFERENCES pupils (login) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (lesson_id) REFERENCES lessons (lesson_id) ON UPDATE CASCADE ON DELETE CASCADE
          )`
        )

        await client.query(
          `create table fin_grades (
            subject_id integer not null,
            grade character varying(5) not null,
            grade_num integer not null,
            p_login character varying(15) not null,
            t_login character varying(15) not null,
            group_id integer not null,
            start_year date not null,
            FOREIGN KEY (p_login) REFERENCES pupils (login) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (t_login, group_id, subject_id) REFERENCES tsg (login, group_id, subject_id) ON UPDATE CASCADE,
            CHECK (grade_num > 0 and grade_num <= 4),
            primary key(p_login, start_year, grade_num)
          )`
        )

        await client.query("COMMIT")
      } catch (e) {
        await client.query("ROLLBACK")
        throw e
      } finally {
        client.release()
      }
    })().catch((e) => e)

    if (trunc_err) {
      throw trunc_err
    }

    pool.end()

    console.log("Таблицы сгенерированы")
  })()
} catch (err) {
  console.error(err)
}
