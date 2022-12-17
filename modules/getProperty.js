module.exports = (object, property) => {
  if (property in object == false)
    throw new Error(`Свойства ${property} нет в Объекте`)
  return object[property]
}