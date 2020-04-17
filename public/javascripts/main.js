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
  const data = await fetchAll()
  const humans = data.map(jsonHuman => new Human(jsonHuman))
  humans.forEach(human => console.log(human.first_name, human.birth_last_name, human._id))
  state.humans = [...humans]
  setUpLinks()
}

async function fetchAll () {
  // No error handling 😎
  const res = await window.fetch('/api/list-humans')
  const data = await res.json()
  const humans = data.data
  return humans
}

function setUpLinks () {
  state.humans.forEach(human => {
    // Save the link [child - parent] in parents
    if (human.parent_1) {
      const parent1 = getHumanFromId(human.parent_1)
      const humansIds = [human.parent_1, human._id]
      const id = [...humansIds].sort().join('-')
      state.links.parents.push({ id, humans_ids: humansIds })
    }
    // Save the link [child - parent] in parents
    if (human.parent_2) {
      const parent2 = getHumanFromId(human.parent_2)
      const humansIds = [human.parent_2, human._id]
      const id = [...humansIds].sort().join('-')
      state.links.parents.push({ id, humans_ids: humansIds })
    }
    // Save the link [parent - parent] in partners
    if (human.parent_1 && human.parent_2) {
      const parent1 = getHumanFromId(human.parent_1)
      const parent2 = getHumanFromId(human.parent_2)
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
      // human.get.sibilings.push(...sibilings)
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
      // human.get.sibilings_from_1.push(...sibilingsFrom1)
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
      // human.get.sibilings_from_2.push(...sibilingsFrom2)
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
      // human.get.sibilings_from_1.push(...sibilingsFrom1)
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
      // human.get.sibilings_from_2.push(...sibilingsFrom2)
      sibilingsFrom2.forEach(sibiling => {
        const humansIds = [human._id, sibiling._id]
        const id = [...humansIds].sort().join('-')
        const alreadyExists = state.links.sibilings_from_2.find(pair => pair.id === id)
        if (!alreadyExists) state.links.sibilings_from_2.push({ id, humans_ids: humansIds })
      })
    }
  })
}

function Human (jsonHuman) {
  Object.keys(jsonHuman).forEach(key => { this[key] = jsonHuman[key] })
  this.x = Math.random() * windowWidth
  this.y = mapDateToPosition(jsonHuman.birth_date)
  this.vx = Math.random() * 60 - 30
  this.vy = 0
  this.fx = 0
  this.fy = 0
  
  Object.defineProperty(this, 'v', {
    get () { return Math.pow(Math.pow(this.vx, 2) + Math.pow(this.vy, 2), .5) }
  })

  Object.defineProperty(this, 'direction', {
    get () {
      if (this.vx >= 0 && this.vy >= 0) return 180 * Math.atan(this.vy / this.vx) / Math.PI
      else if (this.vy >= 0) return 180 + 180 * Math.atan(this.vy / this.vx) / Math.PI
      else if (this.vx < 0) return 180 * Math.atan(this.vy / this.vx) / Math.PI - 180
      else return 180 * Math.atan(this.vy / this.vx) / Math.PI
    }
  })

  this.directionTo = function (x, y) {
    const dx = x - this.x
    const dy = y - this.y
    if (dx >= 0 && dy >= 0) return 180 * Math.atan(dy / dx) / Math.PI
    else if (dy >= 0) return 180 + 180 * Math.atan(dy / dx) / Math.PI
    else if (dx < 0) return 180 * Math.atan(dy / dx) / Math.PI - 180
    else return 180 * Math.atan(dy / dx) / Math.PI
  }

  this.distanceTo = function (x, y) {
    return [
      Math.pow(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2), .5),
      x - this.x,
      y - this.y
    ]
  }

  this.get = function (relationship) {
    // Parents
    if (relationship === 'parents') {
      return state.humans.filter(otherHuman => (
        otherHuman._id === this.parent_1
        || otherHuman._id === this.parent_2
      ))
    // Children
    } else if (relationship === 'children') {
      return state.humans.filter(otherHuman => (
        otherHuman.parent_1 === this._id
        || otherHuman.parent_2 === this._id
      ))
    // Partners
    } else if (relationship === 'partners') {
      const children = this.get('children')
      const childrenParentsIds = []
      children.forEach(child => {
        if (child.parent_1) childrenParentsIds.push(child.parent_1)
        if (child.parent_2) childrenParentsIds.push(child.parent_2)
      })
      const partnersIds = [...new Set(childrenParentsIds.filter(id => id !== this._id))]
      return state.humans.filter(otherHuman => partnersIds.indexOf(otherHuman._id) > -1)
    // Sibilings from 1
    } else if (relationship === 'sibilings-from-1') {
      if (!this.parent_1) return []
      return state.humans.filter(otherHuman => (
        otherHuman.parent_1 === this.parent_1
        || otherHuman.parent_2 === this.parent_1
      )).filter(otherHuman => otherHuman._id !== this._id)
    // Sibilings from 2
    } else if (relationship === 'sibilings-from-2') {
      if (!this.parent_2) return []
      return state.humans.filter(otherHuman => (
        otherHuman.parent_1 === this.parent_2
        || otherHuman.parent_2 === this.parent_2
      )).filter(otherHuman => otherHuman._id !== this._id)
    // All sibilings
    } else if (relationship === 'sibilings') {
      const from1 = this.get('sibilings-from-1')
      const from2 = this.get('sibilings-from-2')
      return [...new Set([...from1, ...from2])]
    // Pure sibilings
    } else if (relationship === 'pure-sibilings') {
      const from1 = this.get('sibilings-from-1')
      const from2 = this.get('sibilings-from-2')
      const pure = []
      from1.forEach(sibilingFrom1 => {
        if (from2.findIndex(sibilingsFrom2 => sibilingsFrom2._id === sibilingFrom1._id) === -1) return
        pure.push(sibilingFrom1)
      })
      from2.forEach(sibilingFrom2 => {
        if (from1.findIndex(sibilingsFrom1 => sibilingsFrom1._id === sibilingFrom2._id) === -1) return
        pure.push(sibilingFrom2)
      })
      return [...new Set(pure)]

    } else return []
  }
}

function getHumanFromId (id) {
  const human = state.humans.find(human => human._id === id)
  return human
}

function mapDateToPosition (date) {
  return Math.random() * windowHeight
  if (!date) return 40
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
  frameRate(18)
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
  const selectedHumans = state.humans.slice(0, 1)
  selectedHumans.forEach(human => {
    
    // Bounce
    const xBounceFactor = -0.9
    const yBounceFactor = -1
    if (human.x > windowWidth) {
      human.x = windowWidth - (human.x - windowWidth)
      human.vx *= xBounceFactor
    } else if (human.x < 0) {
      human.x = -1 * human.x
      human.vx *= xBounceFactor
    }

    if (human.y > windowHeight) {
      human.y = windowHeight - (human.y - windowHeight)
      human.vy *= yBounceFactor
    } else if (human.y < 0) {
      human.y = -1 * human.y
      human.vy *= yBounceFactor
    }

    // Shortcuts
    const absVx = Math.abs(human.vx)
    const absVy = Math.abs(human.vy)
    const sqVx = Math.pow(human.vx, 2)
    const sqVy = Math.pow(human.vy, 2)
    const sqrtVx = Math.pow(human.vx, .5)
    const sqrtVy = Math.pow(human.vy, .5)
    const xDirectionBit = absVx ? (human.vx / absVx) : 0
    const yDirectionBit = absVy ? (human.vy / absVy) : 0

    // Gravity
    const gravity = 1
    human.fy += gravity

    // Air resistance
    // const airResistanceFactor1 = .999
    // const airResistanceFactor2 = .1
    // const xAirResist = -1 * xDirectionBit * Math.pow((sqrtVx * airResistanceFactor1), 2) * airResistanceFactor2
    // const yAirResist = -1 * yDirectionBit * Math.pow((sqrtVy * airResistanceFactor1), 2) * airResistanceFactor2
    // human.fx += xAirResist
    // human.fy += yAirResist

    // Collisions
    selectedHumans.forEach(otherHuman => {
      if (otherHuman._id === human._id) return
      const [distance, xDistance, yDistance] = human.distanceTo(otherHuman.x, otherHuman.y)
      const axis = human.directionTo(otherHuman.x, otherHuman.y)
      if (distance < 10) {
        console.log(
          'CHOC !',
          xDistance.toString().slice(0, 5),
          yDistance.toString().slice(0, 5),
          axis.toString().slice(0, 5),
          human.direction.toString().slice(0, 5)
        )
      }
    })
  })

  selectedHumans.forEach(human => {
    // Convert forces into speed
    human.vx += human.fx
    human.vy += human.fy

    // console.log(human.fx, human.fy)

    human.fx = 0;
    human.fy = 0;

    // Apply speed
    human.x += human.vx
    human.y += human.vy
    // Links
    // human.get('parents').forEach(parent => {
    //   stroke(255, 255, 255, 30)
    //   strokeWeight(1)
    //   noFill()
    //   line(human.x, human.y, parent.x, parent.y)
    // })
    // Safe space ellipse

    console.log(human.x, human.y, human.v)

    console.log("=================")

    noStroke()
    fill(200, 200, 200, 15)
    ellipse(
      human.x,
      human.y,
      40,
      40
    )
    // Ellipse
    if (human.gender === 'M') fill('indianred')
    else if (human.gender === 'F') fill('royalblue')
    else fill(0, 255, 0, 255)
    ellipse(
      human.x,
      human.y,
      10,
      10
    )
  })

}

