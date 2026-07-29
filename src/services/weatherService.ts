import type { WeatherData } from '../types';

export async function fetchWeatherForDestination(destination: string): Promise<WeatherData | null> {
  try {
    // 1. Geocoding via Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=fr&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    const { latitude, longitude } = geoData.results[0];

    // 2. Weather forecast via Open-Meteo Weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    if (!current) return null;

    const weatherInfo = getWeatherInfoFromCode(current.weathercode);

    return {
      temperature: Math.round(current.temperature),
      weatherCode: current.weathercode,
      description: weatherInfo.description,
      weatherDescription: weatherInfo.description,
      icon: weatherInfo.icon,
      windSpeed: current.windspeed
    };
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return null;
  }
}

function getWeatherInfoFromCode(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Ensoleillé', icon: '☀️' };
  if (code >= 1 && code <= 3) return { description: 'Partiellement nuageux', icon: '⛅' };
  if (code >= 45 && code <= 48) return { description: 'Brouillard', icon: '🌫️' };
  if (code >= 51 && code <= 67) return { description: 'Pluie légère / Bruine', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { description: 'Neige', icon: '❄️' };
  if (code >= 80 && code <= 82) return { description: 'Averses', icon: '🌦️' };
  if (code >= 95 && code <= 99) return { description: 'Orageux', icon: '⛈️' };

  return { description: 'Météo variable', icon: '🌤️' };
}
