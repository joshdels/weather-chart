// Init Leaflet map
const map = L.map('map').setView([52.52, 13.41], 5); // Berlin default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let chart1Instance;
let chart2Instance;

async function loadWeather(lat, lon, showPopup = true) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum&past_days=7&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const labels = data.daily.time;
  const maxTemp = data.daily.temperature_2m_max;
  const minTemp = data.daily.temperature_2m_min;
  const windSpeed = data.daily.wind_speed_10m_max;
  const precipitation = data.daily.precipitation_sum;
  const city = data.timezone.split("/")[1];
  
  const todayMax = maxTemp[7];
  const todayMin = minTemp[7];
  const todayWind = windSpeed[7];
  const todayPrecip = precipitation[7];

  document.querySelector("#daily-barChart h3").textContent = `Daily Weather of ${city}` 

  if (showPopup) {
    L.popup()
      .setLatLng([lat, lon])
      .setContent(`
        <b>${city}'s Today Weather</b> <br>
        Temp: ${todayMin}°C – ${todayMax}°C <br>
        Wind: ${todayWind} kph <br>
        Precipitation: ${todayPrecip} mm
      `)
      .openOn(map);
  }

  if (chart1Instance) chart1Instance.destroy();
  if (chart2Instance) chart2Instance.destroy();

  const ctx2 = document.getElementById("chart2").getContext("2d");
  
  chart2Instance = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels, // e.g. ["2024-06-01", "2024-06-02", ...]
      datasets: [
        {
          label: "Max Temp (°C)",
          data: maxTemp, // e.g. [12, 15, 14, ...]
          borderColor: "red",
          backgroundColor: "red",
          fill: false
        },
        {
          label: "Min Temp (°C)",
          data: minTemp, // e.g. [5, 7, 6, ...]
          borderColor: 'yellow',
          backgroundColor: "yellow",
          fill: false
        },
        {
          label: "Precipitation (mm)",
          data: precipitation, // e.g. [5, 7, 6, ...]
          borderColor: 'blue',
          backgroundColor: "blue",
          fill: false
        },
        {
          label: "Wind Speed (kph)",
          data: windSpeed, // e.g. [5, 7, 6, ...]
          borderColor: "green",
          backgroundColor: "green",
          fill: false
        }
      ]
    },
  });

  const ctx1 = document.getElementById("chart1").getContext("2d");

  chart1Instance = new Chart(ctx1, {
    type: "bar",
    data: {
      labels:["Today"],
      datasets: [
        {
          label: "Max Temp (°C)",
          data: [todayMax], // e.g. [12, 15, 14, ...]
          borderColor: "red",
          backgroundColor: "red",
          fill: false
        },
        {
          label: "Min Temp (°C)",
          data: [todayMin], // e.g. [12, 15, 14, ...]
          borderColor: "yellow",
          backgroundColor: "yellow",
          fill: false
        },
        {
          label: "Precipitation (mm)",
          data: [todayPrecip], // e.g. [12, 15, 14, ...]
          borderColor: "blue",
          backgroundColor: "blue",
          fill: false
        },
        {
          label: "Wind Speed (kph)",
          data: [todayWind], // e.g. [12, 15, 14, ...]
          borderColor: "green",
          backgroundColor: "green",
          fill: false
        },
      ]

    }
  })
}

// On map click → fetch weather + show popup
map.on("click", e => {
  const { lat, lng } = e.latlng;
  loadWeather(lat, lng, true);
});

// Load default location (Berlin, without popup)
loadWeather(52.52, 13.41);
