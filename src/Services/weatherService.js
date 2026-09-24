
const WEATHER_ENDPOINT =
  import.meta.env?.VITE_WEATHER_API ?? 'https://api.open-meteo.com/v1/forecast';

// Coordenadas de Orotina, Alajuela, Costa Rica
export const OROTINA_COORDS = { lat: 9.9118, lon: -84.5236 };

const WEATHER_CODES = {
  0: { texto: 'Cielo despejado', icono: 'sun' },
  1: { texto: 'Mayormente despejado', icono: 'sun' },
  2: { texto: 'Parcialmente nublado', icono: 'cloud-sun' },
  3: { texto: 'Nublado', icono: 'cloud' },
  45: { texto: 'Neblina', icono: 'cloud-fog' },
  48: { texto: 'Neblina con escarcha', icono: 'cloud-fog' },
  51: { texto: 'Llovizna ligera', icono: 'cloud-drizzle' },
  61: { texto: 'Lluvia ligera', icono: 'cloud-rain' },
  63: { texto: 'Lluvia moderada', icono: 'cloud-rain' },
  65: { texto: 'Lluvia intensa', icono: 'cloud-rain-wind' },
  80: { texto: 'Aguaceros', icono: 'cloud-rain' },
  95: { texto: 'Tormenta eléctrica', icono: 'cloud-lightning' },
};

export const describeWeatherCode = (code) =>
  WEATHER_CODES[code] ?? { texto: 'Condición variable', icono: 'cloud' };

export const weatherService = {
  async forecast({ lat = OROTINA_COORDS.lat, lon = OROTINA_COORDS.lon, days = 5 } = {}) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'America/Costa_Rica',
      forecast_days: days,
    });

    const res = await fetch(`${WEATHER_ENDPOINT}?${params.toString()}`);
    if (!res.ok) throw new Error('No se pudo obtener el pronóstico del clima.');

    const data = await res.json();
    const daily = data.daily.time.map((fecha, i) => ({
      fecha,
      codigo: data.daily.weather_code[i],
      ...describeWeatherCode(data.daily.weather_code[i]),
      max: Math.round(data.daily.temperature_2m_max[i]),
      min: Math.round(data.daily.temperature_2m_min[i]),
      lluvia: data.daily.precipitation_probability_max[i],
    }));

    return {
      actual: {
        temperatura: Math.round(data.current.temperature_2m),
        humedad: data.current.relative_humidity_2m,
        viento: Math.round(data.current.wind_speed_10m),
        ...describeWeatherCode(data.current.weather_code),
      },
      diario: daily,
      actualizadoEn: new Date().toISOString(),
    };
  },

  /** Recomendación para eventos al aire libre */
  evaluarAireLibre(day) {
    if (!day) return { apto: false, mensaje: 'Sin datos de pronóstico.' };
    if (day.lluvia >= 70)
      return { apto: false, mensaje: `Alta probabilidad de lluvia (${day.lluvia}%). Se recomienda trasladar a un espacio techado.` };
    if (day.max >= 34)
      return { apto: false, mensaje: `Temperatura máxima de ${day.max}°C. Riesgo para actividades prolongadas al aire libre.` };
    return { apto: true, mensaje: `Condiciones favorables: ${day.texto}, ${day.max}°C máx. y ${day.lluvia}% de lluvia.` };
  },
};