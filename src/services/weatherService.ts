import type { WeatherData } from '../types';

export async function fetchWeatherForDestination(destination: string, latitude?: number, longitude?: number): Promise<WeatherData | null> {
  try {
    let lat = latitude;
    let lng = longitude;

    // If coordinates are not provided, geocode destination using Open-Meteo Geocoding
    if (lat === undefined || lng === undefined) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=fr&format=json`
      );
      if (!geoRes.ok) return null;
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) return null;
      lat = geoData.results[0].latitude;
      lng = geoData.results[0].longitude;
    }

    // Fetch Weather Forecast from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation_probability`
    );
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    const currentWeather = weatherData.current_weather;
    if (!currentWeather) return null;

    const temp = Math.round(currentWeather.temperature);
    const code = currentWeather.weathercode;
    const rainProb = weatherData.hourly?.precipitation_probability?.[0] || 0;

    const info = getWeatherInfoFromCode(code);

    return {
      temperature: temp,
      weatherCode: code,
      weatherDescription: info.description,
      icon: info.icon,
      rainProbability: rainProb
    };
  } catch (err) {
    console.warn('Unable to fetch weather info:', err);
    return null;
  }
}

function getWeatherInfoFromCode(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Ensoleillé', icon: '☀️' };
  if (code === 1 || code === 2) return { description: 'Peu nuageux', icon: '🌤️' };
  if (code === 3) return { description: 'Nuageux', icon: '☁️' };
  if (code >= 45 && code <= 48) return { description: 'Brouillard', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { description: 'Bruine légère', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { description: 'Pluie', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { description: 'Neige', icon: '❄️' };
  if (code >= 80 && code <= 82) return { description: 'Averses', icon: '🌧️' };
  if (code >= 95) return { description: 'Orage', icon: '⛈️' };
  return { description: 'Ciel variable', icon: '⛅' };
}
