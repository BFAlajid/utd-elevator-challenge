import express from 'express'
const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static('.'))

// in-memory elevator state
let elevator = {
  currentFloor: 0,
  stops: 0,
  floorsTraversed: 0,
  requests: [],
  riders: []
}

// GET /api/elevator - returns full elevator state
app.get('/api/elevator', (req, res) => {
  res.json(elevator)
})

// POST /api/requests - add a new pickup request
app.post('/api/requests', (req, res) => {
  const { name, currentFloor, dropOffFloor } = req.body

  if (!name || currentFloor === undefined || dropOffFloor === undefined) {
    return res.status(400).json({ error: 'name, currentFloor, and dropOffFloor are required' })
  }

  if (currentFloor === dropOffFloor) {
    return res.status(400).json({ error: 'currentFloor and dropOffFloor cannot be the same' })
  }

  const person = { name, currentFloor, dropOffFloor }
  elevator.requests.push(person)
  res.status(201).json(person)
})

// GET /api/requests - list all pending requests
app.get('/api/requests', (req, res) => {
  res.json(elevator.requests)
})

// DELETE /api/requests/:name - remove a request by name
app.delete('/api/requests/:name', (req, res) => {
  const index = elevator.requests.findIndex(r => r.name === req.params.name)
  if (index === -1) {
    return res.status(404).json({ error: 'request not found' })
  }
  elevator.requests.splice(index, 1)
  res.json({ removed: req.params.name })
})

// GET /api/riders - list current riders
app.get('/api/riders', (req, res) => {
  res.json(elevator.riders)
})

// POST /api/riders - manually board a rider (moves from requests to riders)
app.post('/api/riders', (req, res) => {
  const { name } = req.body
  const index = elevator.requests.findIndex(r => r.name === name)
  if (index === -1) {
    return res.status(404).json({ error: 'no pending request for that name' })
  }
  const person = elevator.requests.splice(index, 1)[0]
  elevator.riders.push(person)
  res.status(201).json(person)
})

// DELETE /api/riders/:name - remove a rider (drop off)
app.delete('/api/riders/:name', (req, res) => {
  const index = elevator.riders.findIndex(r => r.name === req.params.name)
  if (index === -1) {
    return res.status(404).json({ error: 'rider not found' })
  }
  elevator.riders.splice(index, 1)
  res.json({ removed: req.params.name })
})

// PUT /api/elevator/floor - move elevator to a specific floor
app.put('/api/elevator/floor', (req, res) => {
  const { floor } = req.body
  if (floor === undefined || floor < 0) {
    return res.status(400).json({ error: 'valid floor number required' })
  }

  const distance = Math.abs(floor - elevator.currentFloor)
  elevator.floorsTraversed += distance
  elevator.currentFloor = floor
  res.json(elevator)
})

// POST /api/elevator/dispatch - run the SCAN algorithm
app.post('/api/elevator/dispatch', (req, res) => {
  // runs SCAN synchronously and returns the final state
  while (elevator.requests.length || elevator.riders.length) {
    let highest = elevator.currentFloor
    elevator.requests.forEach(r => {
      highest = Math.max(highest, r.currentFloor, r.dropOffFloor)
    })
    elevator.riders.forEach(r => {
      highest = Math.max(highest, r.dropOffFloor)
    })

    while (elevator.currentFloor < highest) {
      elevator.currentFloor++
      elevator.floorsTraversed++
      checkAndService()
    }

    if (!elevator.requests.length && !elevator.riders.length) break

    let lowest = elevator.currentFloor
    elevator.requests.forEach(r => {
      lowest = Math.min(lowest, r.currentFloor, r.dropOffFloor)
    })
    elevator.riders.forEach(r => {
      lowest = Math.min(lowest, r.dropOffFloor)
    })

    while (elevator.currentFloor > lowest) {
      elevator.currentFloor--
      elevator.floorsTraversed++
      checkAndService()
    }
  }

  res.json(elevator)
})

function checkAndService() {
  let pickup = elevator.requests.some(r => r.currentFloor === elevator.currentFloor)
  let dropoff = elevator.riders.some(r => r.dropOffFloor === elevator.currentFloor)

  if (pickup || dropoff) {
    elevator.stops++

    // pick up
    let waiting = elevator.requests.filter(r => r.currentFloor === elevator.currentFloor)
    waiting.forEach(p => {
      elevator.riders.push(p)
      elevator.requests.splice(elevator.requests.indexOf(p), 1)
    })

    // drop off
    elevator.riders = elevator.riders.filter(r => r.dropOffFloor !== elevator.currentFloor)
  }
}

// POST /api/elevator/reset - reset everything
app.post('/api/elevator/reset', (req, res) => {
  elevator = {
    currentFloor: 0,
    stops: 0,
    floorsTraversed: 0,
    requests: [],
    riders: []
  }
  res.json(elevator)
})

app.listen(PORT, () => {
  console.log('Elevator API running on http://localhost:' + PORT)
})
