export default class Elevator {
  constructor() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders = []
  }

  // processes all pending requests using a SCAN algorithm —
  // sweeps up to the highest needed floor, then back down,
  // picking up and dropping off everyone along the way
  dispatch() {
    while (this.requests.length || this.riders.length) {
      let highest = this.currentFloor
      this.requests.forEach(r => {
        highest = Math.max(highest, r.currentFloor, r.dropOffFloor)
      })
      this.riders.forEach(r => {
        highest = Math.max(highest, r.dropOffFloor)
      })

      // sweep up
      while (this.currentFloor < highest) {
        this.moveUp()
        if (this.hasStop()) {
          this.stops++
          this.hasPickup()
          this.hasDropoff()
        }
      }

      if (!this.requests.length && !this.riders.length) break

      let lowest = this.currentFloor
      this.requests.forEach(r => {
        lowest = Math.min(lowest, r.currentFloor, r.dropOffFloor)
      })
      this.riders.forEach(r => {
        lowest = Math.min(lowest, r.dropOffFloor)
      })

      // sweep down
      while (this.currentFloor > lowest) {
        this.moveDown()
        if (this.hasStop()) {
          this.stops++
          this.hasPickup()
          this.hasDropoff()
        }
      }
    }
  }

  // handles a single person's full trip: go to their floor, pick them up, take them to their destination
  goToFloor(person) {
    while (this.currentFloor !== person.currentFloor) {
      if (this.currentFloor < person.currentFloor) {
        this.moveUp()
      } else {
        this.moveDown()
      }
    }

    this.stops++
    this.hasPickup()

    while (this.currentFloor !== person.dropOffFloor) {
      if (this.currentFloor < person.dropOffFloor) {
        this.moveUp()
      } else {
        this.moveDown()
      }
    }

    this.stops++
    this.hasDropoff()
  }

  moveUp() {
    this.currentFloor++
    this.floorsTraversed++
  }

  moveDown() {
    if (this.currentFloor > 0) {
      this.currentFloor--
      this.floorsTraversed++
    }
  }

  hasStop() {
    let pickup = this.requests.some(r => r.currentFloor === this.currentFloor)
    let dropoff = this.riders.some(r => r.dropOffFloor === this.currentFloor)
    return pickup || dropoff
  }

  // moves everyone waiting on this floor from requests into riders
  hasPickup() {
    let waiting = this.requests.filter(r => r.currentFloor === this.currentFloor)
    waiting.forEach(person => {
      this.riders.push(person)
      this.requests.splice(this.requests.indexOf(person), 1)
    })
  }

  // removes all riders whose destination is this floor
  hasDropoff() {
    this.riders = this.riders.filter(r => r.dropOffFloor !== this.currentFloor)
  }

  checkReturnToLoby(){
    // add your code here
  }

  returnToLoby(){
    while(this.currentFloor > 0){
      this.moveDown()
    }
  }

  reset(){
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.riders = []
  }
}
