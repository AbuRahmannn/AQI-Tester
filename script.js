document.getElementById("searchCity").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    if (city) {
        getCityCoordinates(city);
    } else {
        alert("Please enter a city name.");
    }
});

document.getElementById("getLocation").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getAQI(lat, lon);
            },
            (error) => {
                alert("Geolocation access denied. Please allow location access.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

let map;
let marker;
let aqiChart;

function initMap(lat, lon) {
    if (!map) {
        map = L.map("map").setView([lat, lon], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
    }

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup("Fetching AQI...").openPopup();
}

function getCityCoordinates(city) {
    const apiKey = "process.env.API_KEY";
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                document.getElementById("cityName").innerText = `City: ${data[0].name}`;
                getAQI(lat, lon);
            } else {
                alert("City not found. Try another name.");
            }
        })
        .catch(error => console.error("Error fetching city coordinates:", error));
}

function getAQI(lat, lon) {
    const apiKey = "process.env.API_KEY";
    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.list && data.list.length > 0) {
                const aqi = data.list[0].main.aqi;
                const components = data.list[0].components;

                document.getElementById("aqi").innerHTML = `
                    <strong>AQI Level:</strong> ${aqi} <br>
                    <strong>${getAQIMessage(aqi)}</strong>
                `;

                document.getElementById("pm25").innerText = components.pm2_5.toFixed(2);
                document.getElementById("pm10").innerText = components.pm10.toFixed(2);
                document.getElementById("no2").innerText = components.no2.toFixed(2);
                document.getElementById("co").innerText = components.co.toFixed(2);
                document.getElementById("so2").innerText = components.so2.toFixed(2);
                document.getElementById("o3").innerText = components.o3.toFixed(2);

                initMap(lat, lon);
                marker.bindPopup(`AQI: ${aqi} <br> ${getAQIMessage(aqi)}`).openPopup();

                updateChart();
                updateAQI(aqi); // Update the AQI meter
            } else {
                document.getElementById("aqi").innerHTML = "AQI data not available.";
            }
        })
        .catch(error => console.error("Error fetching AQI data:", error));
}

function getAQIMessage(aqi) {
    if (aqi === 1) return "Good (0-50): No mask needed!";
    else if (aqi === 2) return "Moderate (51-100): Mask recommended.";
    else if (aqi === 3) return "Sensitive (101-150): Mask is compulsory!!!";
    else if (aqi === 4) return "Unhealthy (151-200): Max. avoid outdoor activities!!!";
    else if (aqi === 5) return "Hazardous (200+): Stay indoors!!!";
    return "No data available.";
}

function updateChart() {
    const ctx = document.getElementById("aqiChart").getContext("2d");
    const hours = ["11 PM", "01 AM", "03 AM", "05 AM", "07 AM", "09 AM", "11 AM", "01 PM", "03 PM", "05 PM", "07 PM", "09 PM", "11 PM"];
    const values = Array.from({ length: hours.length }, () => Math.floor(Math.random() * 100) + 20);

    if (aqiChart) {
        aqiChart.destroy();
    }

    aqiChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: hours,
            datasets: [{ label: "AQI Levels", backgroundColor: "yellow", data: values }]
        }
    });
}

function updateAQI(aqi) {
    const meterCircle = document.querySelector(".meter-circle");

    // Update meter color based on AQI range
    if (aqi === 1) {
        meterCircle.style.stroke = "green";
    } else if (aqi === 2) {
        meterCircle.style.stroke = "yellow";
    } else if (aqi === 3) {
        meterCircle.style.stroke = "orange";
    } else if (aqi === 4) {
        meterCircle.style.stroke = "red";
    } else {
        meterCircle.style.stroke = "purple";
    }
}


document.getElementById("getApp").addEventListener("click", function() {
    window.open("https://drive.google.com/file/d/1xXXahmkrmAuwDF7h8rBwy_cknwr84sMK/view?usp=drive_link", "_blank");
});

document.getElementById("contactCPCB").addEventListener("click", function() {
    window.open("https://cpcb.nic.in/National-Air-Quality-Index/", "_blank");
});
