document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityNameEl = document.getElementById('city-name');
    const dateEl = document.getElementById('date');
    const temperatureEl = document.getElementById('temperature');
    const descriptionEl = document.getElementById('description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const weatherIconEl = document.getElementById('weather-icon');
    const bodyEl = document.body;
    
    // This is the div for displaying error messages in the UI.
    const errorMessageEl = document.getElementById('error-message');

    // Using the new API key you provided
    const apiKey = 'c746666381523f8387a412c8fa6ad920';

    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeatherData(city);
            }
        }
    });

    async function getWeatherData(city) {
        // Clear any previous error messages when a new search begins
        errorMessageEl.textContent = '';
        errorMessageEl.style.display = 'none';
        
        // Show loading state
        cityNameEl.textContent = 'Loading...';
        cityNameEl.classList.add('loading');
        temperatureEl.textContent = '';
        descriptionEl.textContent = '';
        humidityEl.textContent = '';
        windSpeedEl.textContent = '';
        weatherIconEl.src = '';
        dateEl.textContent = '';
        
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!response.ok) {
                // If the response is not okay, throw an error
                if (data.cod === 401) {
                    throw new Error('API Error 401: Unauthorized. Please check your API key.');
                } else if (data.cod === 404) {
                    throw new Error('City not found! Please check the spelling and try again.');
                } else {
                    throw new Error(`Error ${data.cod}: ${data.message}`);
                }
            }
            
            updateUI(data);
        } catch (error) {
            // Display the error message in the dedicated UI element
            errorMessageEl.textContent = error.message;
            errorMessageEl.style.display = 'block';
            
            // Reset UI elements
            cityNameEl.textContent = 'City not found';
            cityNameEl.classList.remove('loading');
            temperatureEl.textContent = '-';
            descriptionEl.textContent = 'Please try another city';
            humidityEl.textContent = '-';
            windSpeedEl.textContent = '-';
            weatherIconEl.src = '';
            
            // Set current date
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString(undefined, options);
        }
    }

    function updateUI(data) {
        const { name, sys, main, weather, wind, dt, timezone } = data;

        // Remove loading animation
        cityNameEl.classList.remove('loading');

        // Update weather details
        cityNameEl.textContent = `${name}, ${sys.country}`;
        temperatureEl.textContent = Math.round(main.temp);
        descriptionEl.textContent = weather[0].description;
        humidityEl.textContent = `${main.humidity}%`;
        windSpeedEl.textContent = `${wind.speed} m/s`;

        // Weather icon
        weatherIconEl.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
        weatherIconEl.alt = weather[0].description;

        // Update date and time
        const localTime = new Date((dt + timezone) * 1000);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateEl.textContent = localTime.toLocaleDateString(undefined, options);

        // Change UI based on weather and time
        updateBackground(weather[0].main, dt, timezone);
    }

    function updateBackground(weatherCondition, dt, timezone) {
        const localHour = new Date((dt + timezone) * 1000).getUTCHours();
        const isDaytime = localHour >= 6 && localHour < 18;

        const backgrounds = {
            'Clear': {
                day: 'https://images.unsplash.com/photo-1558231908-4187e5b22079?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHw3fHxjbGVhciUyMHNreSUyMGRheXxlbnwwfHx8fDE2Mjk3ODE5MjA&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1475274058133-5fb9019277d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxMXx8Y2xlYXIlMjBza3klMjBuaWdodHxlbnwwfHx8fDE2Mjk3ODE5MTk&ixlib=rb-1.2.1&q=80&w=1080'
            },
            'Clouds': {
                day: 'https://images.unsplash.com/photo-1502444330042-d1a2933758a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwzfHxjbG91ZHklMjBkYXl8ZW58MHx8fHwxNjI5NzgxODU1&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1510443906660-c4bfd0a2f44c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxM3x8Y2xvdWR5JTIwbmlnaHR8ZW58MHx8fHwxNjI5NzgxODU1&ixlib=rb-1.2.1&q=80&w=1080'
            },
            'Rain': {
                day: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxNHx8cmFpbiUyMGRheXxlbnwwfHx8fDE2Mjk3ODE5OTY&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1521406606085-f12b62a63750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxM3x8cmFpbiUyMG5pZ2h0fGVufDB8fHx8MTYyOTc4MTk5Nw&ixlib=rb-1.2.1&q=80&w=1080'
            },
            'Thunderstorm': {
                day: 'https://images.unsplash.com/photo-1550401874-845231792942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxM3x8dGhlbmRlcnN0b3JtJTIwZGF5fGVufDB8fHx8MTYyOTc4MjA2NQ&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1556942007-3532f111b7ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxNnx8dGhlbmRlcnN0b3JtmJTIwbmlnaHR8ZW58MHx8fHwxNjI5NzgyMDYz&ixlib=rb-1.2.1&q=80&w=1080'
            },
            'Snow': {
                day: 'https://images.unsplash.com/photo-1517299321689-526487593c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHw1fHxzbndlY2FwZSUyMGRheXxlbnwwfHx8fDE2Mjk3ODI1NDY&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1517299321689-526487593c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxMnx8c25vdyUyMG5pZ2h0fGVufDB8fHx8MTYyOTc4MjU1Mg&ixlib=rb-1.2.1&q=80&w=1080'
            },
            'Mist': {
                day: 'https://images.unsplash.com/photo-1520146059530-9b48f657e23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHw3fHxtaXN0eSUyMGRheXxlbnwwfHx8fDE2Mjk3ODI2NTU&ixlib=rb-1.2.1&q=80&w=1080',
                night: 'https://images.unsplash.com/photo-1520146059530-9b48f657e23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHwxM3x8Zm9nZ3klMjBuaWdodHxlbnwwfHx8fDE2Mjk3ODI2NTU&ixlib=rb-1.2.1&q=80&w=1080'
            }
        };

        const weatherKey = weatherCondition === 'Drizzle' ? 'Rain' : weatherCondition;
        const imageUrl = isDaytime ? backgrounds[weatherKey]?.day : backgrounds[weatherKey]?.night;
        
        if (imageUrl) {
            bodyEl.style.backgroundImage = `url('${imageUrl}')`;
        } else {
            bodyEl.style.backgroundImage = `url('https://images.unsplash.com/photo-1549880338-65ddcdfd017b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHw3fHxwbGVhc2FudCUyMHdlYXRoZXIlMjBtb3VudGFpbnN8ZW58MHx8fHwxNjI5NzgyNTcw&ixlib=rb-1.2.1&q=80&w=1080')`;
        }
        
        // Add a fallback in case the image fails to load
        bodyEl.onerror = function() {
            bodyEl.style.backgroundImage = "url('https://images.unsplash.com/photo-1549880338-65ddcdfd017b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMzczOTd8MHwxfHNlYXJjaHw3fHxwbGVhc2FudCUyMHdlYXRoZXIlMjBtb3VudGFpbnN8ZW58MHx8fHwxNjI5NzgyNTcw&ixlib=rb-1.2.1&q=80&w=1080')";
        };
    }

    // Initial load with a default city
    getWeatherData('London');
});



