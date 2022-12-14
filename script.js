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
  id = Date.now().toString().slice(-10);
  constructor(distance, duration, coords) {
    this.type;
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    //this._setDescribtion();
  }
  _setDescribtion() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

// running class inheriting from workout class
class Running extends Workout {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.running();
    this._setDescribtion();
  }
  running() {
    this.run = this.distance / this.duration;
    return this.run;
  }
}

// cycling class inheriting from workout class
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.cycling();
    this._setDescribtion();
  }
  cycling() {
    this.cyc = this.distance / (this.duration / 60);
  }
}

const workout = new Workout();
const cycling = new Cycling();

// actual logic (actions)
class App {
  #map;
  #mapE;
  #workouts = [];
  #date = new Date();
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
    form.style.display = 'grid'
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';
    form.classList.add('hidden');
    form.style.display = 'none'
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

    if (type === 'running') {
      const cadence = parseInt(inputCadence.value);
      if (
        !Number.isFinite(distance) ||
        distance < 0 ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        !Number.isFinite(cadence) ||
        cadence < 0
      ) {
        return alert('unvalid');
      }
      workout = new Running(distance, duration, [lat, lng], cadence);
      this.#workouts.push(workout);
    }

    if (type === 'cycling') {
      const elevation = parseInt(inputElevation.value);
      if (
        !Number.isFinite(distance) ||
        distance < 0 ||
        !Number.isFinite(duration) ||
        duration < 0 ||
        !Number.isFinite(elevation)
      ) {
        return alert('unvalid');
      }
      workout = new Cycling(distance, duration, [lat, lng], elevation);
      this.#workouts.push(workout);
    }
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
    L.marker(workout.coords, myIcon)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 50,
          autoClose: false,
          closeOnEscapeKey: true,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ?'🏃‍♂️' : '🚴‍♀️'}  ${workout.description}`)
      .openPopup();
      this._renderWorkout(workout);
      this._hideForm();
  }

  _renderWorkout(workout) {
    let HTML = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running') {
      HTML += `  
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.run.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>`;
    }
    if (workout.type === 'cycling') {
      HTML += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.cyc.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
      `;
    }
    form.insertAdjacentHTML('afterend', HTML)
  }
}
const app = new App();
