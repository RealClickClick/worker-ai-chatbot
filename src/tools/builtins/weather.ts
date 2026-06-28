import type { ToolDefinition } from '../types.ts';
import { FETCH_TIMEOUT_MS } from '../../constants.ts';

export const weatherTool: ToolDefinition = {
  name: 'weather',
  description: 'Get current weather conditions for any city worldwide.',
  parameters: {
    location: { type: 'string', description: 'City name (e.g., Tehran, London, New York)', required: true },
  },
  execute: async (params) => {
    const location = params.location?.trim();
    if (!location) return 'Please provide a city name.';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) return `Could not fetch weather for "${location}".`;
      const data = await res.json() as any;
      const current = data.current_condition?.[0];
      if (!current) return `No weather data available for "${location}".`;
      const temp = current.temp_C;
      const feelsLike = current.FeelsLikeC;
      const desc = current.weatherDesc?.[0]?.value || 'Unknown';
      const humidity = current.humidity;
      const windSpeed = current.windspeedKmph;
      const windDir = current.winddir16Point;
      const visibility = current.visibility;
      const uvIndex = current.uvIndex;
      return [
        `Location: ${location}`,
        `Condition: ${desc}`,
        `Temperature: ${temp}°C (feels like ${feelsLike}°C)`,
        `Humidity: ${humidity}%`,
        `Wind: ${windSpeed} km/h ${windDir}`,
        `Visibility: ${visibility} km`,
        `UV Index: ${uvIndex}`,
      ].join('\n');
    } catch (e: any) {
      return `Weather lookup failed: ${e.message}`;
    }
  },
};
