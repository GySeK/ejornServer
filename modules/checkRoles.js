const a_roles = ["admin", "pupil", "scheduler", "teacher"]

const match = (roles, a_roles) => {
  for (let role of roles) {
    for (let a_role of a_roles) {
      if (role == a_role) {
        return true
      }
    }
    return false
  }
}

module.exports = (m_roles) => {
  if (m_roles == null)
    throw new Error(`Людского во мне дохуя. Программист анальник стоит и передо мной NULL
   дрочит свои я говорю :'Старина сЪеби нахуй'. Даю просто Error: иди нахуй говорю 'Забирай и сЪебывай'`)

  let roles = []
  if (m_roles.constructor === Array) {
    roles = m_roles
  } else {
    roles.push(m_roles)
  }
  
  if (!match(roles, a_roles))
    throw new Error("Одна из ролей не одобрена партией Тимоффейя Кузлика")
}
