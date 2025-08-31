document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const cityNameEl = document.getElementById('city-name');
    const dateEl = document.getElementById('date');
    const localTimeEl = document.getElementById('local-time');
    const temperatureEl = document.getElementById('temperature');
    const descriptionEl = document.getElementById('description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const weatherIconEl = document.getElementById('weather-icon');
    const bodyEl = document.body;
    
    // This is the div for displaying error messages in the UI.
    const errorMessageEl = document.getElementById('error-message');

    // Using the API key you provided
    const apiKey = 'c746666381523f8387a412c8fa6ad920';

    // For updating the local time continuously
    let timeInterval;

    // Load Mumbai weather by default
    window.onload = function() {
        getWeatherData('Mumbai');
    };

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
        localTimeEl.textContent = '';
        
        // Clear any existing time interval
        if (timeInterval) {
            clearInterval(timeInterval);
        }
        
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

        // Update date
        const localTime = new Date((dt + timezone) * 1000);
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = localTime.toLocaleDateString(undefined, dateOptions);

        // Update local time and set up continuous updating
        updateLocalTime(timezone);
        timeInterval = setInterval(() => updateLocalTime(timezone), 1000);

        // Change UI based on weather and time
        updateBackground(weather[0].main, weather[0].id, dt, timezone);
    }

    function updateLocalTime(timezone) {
        // Calculate local time using the timezone offset (in seconds)
        const now = new Date();
        const localTime = new Date(now.getTime() + (timezone * 1000));
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' };
        localTimeEl.textContent = `Local Time: ${localTime.toLocaleTimeString(undefined, timeOptions)}`;
    }

    function updateBackground(weatherCondition, weatherId, dt, timezone) {
        const localHour = new Date((dt + timezone) * 1000).getUTCHours();
        const isDaytime = localHour >= 6 && localHour < 18;

        // Weather-specific backgrounds with more variety
        const backgrounds = {
            // Clear skies
            'Clear': isDaytime ? 
                'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80' : 
                'https://images.unsplash.com/photo-1532978379173-523e16f371f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Clouds
            'Clouds': isDaytime ? 
                'https://images.unsplash.com/photo-1562155610-e2a5ea9f305d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80' : 
                'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Rain
            'Rain': isDaytime ? 
                'https://images.unsplash.com/photo-1438449805896-28a666819a20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80' : 
                'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Drizzle
            'Drizzle': 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Thunderstorm
            'Thunderstorm': 'https://images.unsplash.com/photo-15988580915-6cf6c759c68d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Snow
            'Snow': 'https://images.unsplash.com/photo-1542603834501-6c379328ae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Mist/Fog/Haze
            'Mist': 'https://images.unsplash.com/photo-1504609773096-6ffb4cdb1f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            'Fog': 'https://images.unsplash.com/photo-1504609773096-6ffb4cdb1f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            'Haze': 'https://images.unsplash.com/photo-1504609773096-6ffb4cdb1f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80',
            
            // Default
            'Default': 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80'
        };

        // Handle different weather conditions
        let weatherKey = weatherCondition;
        if (weatherCondition === 'Drizzle') {
            weatherKey = 'Rain';
        } else if (weatherCondition === 'Fog' || weatherCondition === 'Haze') {
            weatherKey = 'Mist';
        }

        // Select the appropriate background
        const imageUrl = backgrounds[weatherKey] || backgrounds['Default'];
        
        // Create a new image to preload and check if it loads successfully
        const img = new Image();
        img.onload = function() {
            bodyEl.style.backgroundImage = `url('${imageUrl}')`;
        };
        img.onerror = function() {
            // Fallback background if image fails to load
            bodyEl.style.backgroundImage = `url('${backgrounds['Default']}')`;
        };
        img.src = imageUrl;
    }

    // Set initial date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
});






