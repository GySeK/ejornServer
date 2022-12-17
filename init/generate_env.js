const fs = require('fs-extra')
const path = require("path")

;(async () => {
  try {
    await fs.copy(`${__dirname}/.env`, `${path.resolve(__dirname, '../')}/.env`)
    console.log('Завершена генерация .env')
  } catch (err) {
    console.error(err)
  }
})()