// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Loading spinner
document.getElementById('loading').style.display = 'block';

// Fetch population data from API
fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
        document.getElementById('loading').style.display = 'none';
        let countries = [];
        data.forEach(country => {
            if (country.population && country.latlng) {
                countries.push({
                    name: country.translations?.eng?.common || country.name.common,
                    population: country.population,
                    latlng: country.latlng,
                });
            }
        });

        // Sort and get top 10 populous countries
        countries.sort((a, b) => b.population - a.population);
        const top10 = countries.slice(0, 10);

        // Populate table
        const tableBody = document.querySelector('#populationTable tbody');
        top10.forEach(country => {
            const row = tableBody.insertRow();
            row.insertCell(0).innerText = country.name;
            row.insertCell(1).innerText = country.population.toLocaleString();
        });

        // Add countries to map
        countries.forEach(country => {
            const marker = L.circleMarker(country.latlng, {
                radius: 5,
                fillColor: 'blue',
                color: 'white',
                weight: 1,
                fillOpacity: 0.8,
            }).addTo(map);

            marker.bindPopup(`<b>${country.name}</b><br>Population: ${country.population.toLocaleString()}`);
        });

        // Render chart
        renderChart(top10);
    })
    .catch(error => {
        console.error('Error fetching population data:', error);
        document.getElementById('loading').innerText = 'Failed to load data.';
    });

// Reset map view
document.getElementById('resetBtn').addEventListener('click', () => {
    map.setView([20, 0], 2);
});

// Render chart function
function renderChart(top10) {
    const ctx = document.getElementById('populationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(country => country.name),
            datasets: [{
                label: 'Population',
                data: top10.map(country => country.population),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: false, /* Turn off dynamic resizing */
            maintainAspectRatio: false, /* Maintain aspect ratio to avoid distortion */
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

