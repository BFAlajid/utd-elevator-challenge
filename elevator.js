export default class Elevator {
  constructor() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders = []
  }

  dispatch(){
    this.requests.forEach(request => {
      if(this.riders.length || this.requests.length){
        this.goToFloor(request)
      }
    })
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
