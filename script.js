'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// create workout
class Workout {
  date = new Date();
  id = Date.now().toString().slice(-10)
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords
  }
}

// running class inheriting from workout class
class Running extends Workout {
  constructor(distance ,duration,coords ,cadence){
    super(distance,duration, coords)
    this.cadence = cadence;
    this.running();
  }
  running() {
    this.run = this.distance / this.duration;
    return this.run
  }
}

// cycling class inheriting from workout class
class Cycling extends Workout {
  constructor(distance ,duration,coords ,elevationGain){
    super(distance,duration, coords)
    this.elevationGain = elevationGain;
    this.cycling()
  }
  cycling() {
    this.cyc = this.distance / (this.duration / 60)
  }
}

const workout = new Workout();
const cycling = new Cycling(441, 11, [11, 22], 55);

// actual logic (actions)
class App {
  #map;
  #mapE;
  #workouts = [];
  constructor() {
    this._getPosition();

    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkout.bind(this));
  }
  // get position method
  _getPosition() {
    // check if the browser support geolocation
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert("couldn't get your location")
      );
  }
  // load map
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coord = [latitude, longitude];
    this.#map = L.map('map').setView(coord, 15); // first prameter is coords and the second one is zoom level

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //onclick add marker by (on event) it's like addEventListener
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapEvent) {
    this.#mapE = mapEvent;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // define our variables
    const type = inputType.value;
    const distance = parseInt(inputDistance.value);
    const duration = parseInt(inputDuration.value);
    const { lat, lng } = this.#mapE.latlng;
    let workout;

    if(type === 'running'){ 
      const cadence = parseInt(inputCadence.value);
      if(!Number.isFinite(distance) || distance < 0||
      !Number.isFinite(duration) || duration < 0 ||
      !Number.isFinite(cadence) || cadence < 0){
          return alert("unvalid")
      }
      workout  = new Running(distance, duration, [lat, lng], cadence);
      this.#workouts.push(workout)
    }

    if(type === 'cycling'){ 
      const elevation = parseInt(inputElevation.value);
      if(!Number.isFinite(distance) || distance < 0||
      !Number.isFinite(duration) || duration < 0 ||
      !Number.isFinite(elevation) ) {
        return alert("unvalid")
      }
      workout = new Cycling(distance, duration, [lat, lng], elevation);
      this.#workouts.push(workout)
    }
console.log(this.#workouts)
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    // icon
    const myIcon = L.icon({
      iconUrl: 'my-icon.png',
      iconSize: [38, 95],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
      shadowUrl: 'my-icon-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94],
    });

    // display marker
    L.marker([lat, lng], myIcon)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 50,
          autoClose: false,
          closeOnEscapeKey: true,
          closeOnClick: false,
          className: '${wok}-popup',
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}
const app = new App();
