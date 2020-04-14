/* * * * * * * * * * * * * * * *
 *
 * STATE
 *
 * * * * * * * * * * * * * * * */

const state = {
  humans: [],
  links: {
    parents: [],
    children: [],
    sibilings_from_1: [],
    sibilings_from_2: [],
    sibilings: [],
    partners: []
  }
}

/* * * * * * * * * * * * * * * *
 *
 * FETCH DATA, LINK HUMANS BETWEEN THEMSELVES
 *
 * * * * * * * * * * * * * * * */

fetchAllAndSetUpLinks()
async function fetchAllAndSetUpLinks () {
  await fetchAll()
  setUpLinks()
  console.log(state)
}

async function fetchAll () {
  // No error handling 😎
  const res = await window.fetch('/api/list-humans')
  const data = await res.json()
  const humans = data.data
  state.humans = [...humans].map(human => ({
    ...human,
    x: Math.random() * windowWidth,
    y: mapDateToPosition(human.birth_date),
    vx: Math.random() * 8 - 4,
    vy: 0,
    fx: 0,
    fy: 0,
    seed: Math.random(),
    get: {
      parents: [],
      children: [],
      sibilings_from_1: [],
      sibilings_from_2: [],
      sibilings: [],
      partners: []
    }
  }))
  return humans
}

function setUpLinks () {
  state.humans.forEach(human => {
    // Save the link [child - parent] in parents
    if (human.parent_1) {
      const parent1 = getHumanFromId(human.parent_1)
      human.get.parents.push(parent1)
      parent1.get.children.push(human)
      const humansIds = [human.parent_1, human._id]
      const id = [...humansIds].sort().join('-')
      state.links.parents.push({ id, humans_ids: humansIds })
    }
    // Save the link [child - parent] in parents
    if (human.parent_2) {
      const parent2 = getHumanFromId(human.parent_2)
      human.get.parents.push(parent2)
      parent2.get.children.push(human)
      const humansIds = [human.parent_2, human._id]
      const id = [...humansIds].sort().join('-')
      state.links.parents.push({ id, humans_ids: humansIds })
    }
    // Save the link [parent - parent] in partners
    if (human.parent_1 && human.parent_2) {
      const parent1 = getHumanFromId(human.parent_1)
      const parent2 = getHumanFromId(human.parent_2)
      parent1.get.partners.push(parent2)
      parent2.get.partners.push(parent1)
      const humansIds = [human.parent_1, human.parent_2]
      const id = [...humansIds].sort().join('-')
      const alreadyExists = state.links.partners.find(couple => couple.id === id)
      if (!alreadyExists) state.links.partners.push({ id, humans_ids: humansIds })
    }
    // Save the link [sibiling - sibiling] in sibilings, sibilings_from_1 or sibilings_from_2
    if (human.parent_1 && human.parent_2) {
      // Mutuals
      const sibilings = state.humans.filter(otherHuman => (
        (otherHuman.parent_1 === human.parent_1 && otherHuman.parent_2 === human.parent_2)
        || (otherHuman.parent_2 === human.parent_1 && otherHuman.parent_1 === human.parent_2)
      ) && otherHuman._id !== human._id)
      human.get.sibilings.push(...sibilings)
      sibilings.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings.push({ id, humans_ids: humansIds })
      })
      // from parent_1
      const sibilingsFrom1 = state.humans.filter(otherHuman => (
        (otherHuman.parent_1 === human.parent_1 && otherHuman.parent_2 !== human.parent_2)
        || (otherHuman.parent_2 === human.parent_1 && otherHuman.parent_1 !== human.parent_2)
      ) && otherHuman._id !== human._id)
      human.get.sibilings_from_1.push(...sibilingsFrom1)
      sibilingsFrom1.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings_from_1.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings_from_1.push({ id, humans_ids: humansIds })
      })
      // from parent_2
      const sibilingsFrom2 = state.humans.filter(otherHuman => (
        (otherHuman.parent_2 === human.parent_2 && otherHuman.parent_1 !== human.parent_1)
        || (otherHuman.parent_1 === human.parent_2 && otherHuman.parent_2 !== human.parent_1)
      ) && otherHuman._id !== human._id)
      human.get.sibilings_from_2.push(...sibilingsFrom2)
      sibilingsFrom2.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings_from_2.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings_from_2.push({ id, humans_ids: humansIds })
      })
    } else if (human.parent_1) {
      // Only has p_1
      const sibilingsFrom1 = state.humans.filter(otherHuman => (
        otherHuman.parent_1 === human.parent_1 || otherHuman.parent_2 === human.parent_1
      ) && otherHuman._id !== human._id)
      human.get.sibilings_from_1.push(...sibilingsFrom1)
      sibilingsFrom1.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings_from_1.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings_from_1.push({ id, humans_ids: humansIds })
      })
    } else if (human.parent_2) {
      // Only has p_2
      const sibilingsFrom2 = state.humans.filter(otherHuman => (
        otherHuman.parent_2 === human.parent_2 || otherHuman.parent_1 === human.parent_2
      ) && otherHuman._id !== human._id)
      human.get.sibilings_from_2.push(...sibilingsFrom2)
      sibilingsFrom2.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings_from_2.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings_from_2.push({ id, humans_ids: humansIds })
      })
    }
  })
}

function getHumanFromId (id) {
  const human = state.humans.find(human => human._id === id)
  return human
}

function mapDateToPosition (date) {
  if (!date) return 1
  const timestamp = moment(date, 'YYYY-MM-DD')
  const loBound = moment('1780-01-01', 'YYYY-MM-DD')
  const hiBound = moment('2030-01-01', 'YYYY-MM-DD')
  const ratio = (timestamp - loBound) / (hiBound - loBound)
  return ratio * windowHeight
}

/* * * * * * * * * * * * * * * *
 *
 * INIT SKETCH
 *
 * * * * * * * * * * * * * * * */

function setup() {
  createCanvas(windowWidth, windowHeight)
}

/* * * * * * * * * * * * * * * *
 *
 * DRAW SKETCH
 *
 * * * * * * * * * * * * * * * */

function draw() {
  // Draw background
  noStroke()
  background(51)

  // Calculate forces and movements
  state.humans.forEach(human => {
    // Parental attraction
    human.get.parents.forEach(parent => {
      const xDistance = parent.x - human.x
      const yDistance = parent.y - human.y
      const sqDistance = Math.pow(xDistance, 2) + Math.pow(yDistance, 2)
      const distance = Math.pow(sqDistance, 1/2)
      if (distance > 100) {
        const force = (distance - 100) / 1000
        human.fx += (xDistance / distance) * force
        human.fy += (yDistance / distance) * force
      }
    })
    // Personal space repulsion
    state.humans.forEach(otherHuman => {
      if (otherHuman._id === human._id) return
      const xDistance = otherHuman.x - human.x
      const yDistance = otherHuman.y - human.y
      const sqDistance = Math.pow(xDistance, 2) + Math.pow(yDistance, 2)
      const distance = Math.pow(sqDistance, 1/2)
      if (distance < 200) {
        const force = (1 / distance) * 10
        human.fx += (xDistance / distance) * force
        human.fy += (yDistance / distance) * force
      }
    })

    // Air resistance
    human.vx *= .99
    human.vy *= .99
    // Convert force into speed
    human.vx += human.fx / 10
    // human.vy += human.fy / 100
    human.fx = 0;
    human.fy = 0;
    // Apply speed
    human.x += human.vx
    human.y += human.vy
    // Bounce
    if (human.x > windowWidth) {
      human.x = windowWidth - (human.x - windowWidth)
      human.vx = -1 * human.vx
    } else if (human.x < 0) {
      human.x = -1 * human.x
      human.vx = -1 * human.vx
    }
  })

  // Draw humans
  state.humans.forEach(human => {
    human.get.parents.forEach(parent => {
      stroke(0, 0, 255, 120)
      strokeWeight(4)
      noFill()
      line(human.x, human.y, parent.x, parent.y)
    })

    noStroke()
    fill(200, 200, 200, 15)
    ellipse(
      human.x,
      human.y,
      40,
      40
    )

    fill(0, 255, 0, 255)
    ellipse(
      human.x,
      human.y,
      10,
      10
    )
  })
}

