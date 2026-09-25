import { weatherService } from '@/Services/weatherService';

describe('weatherService.forecast', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the feels-like temperature and the next six local hours', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          time: '2026-09-25T10:00',
          temperature_2m: 29.4,
          apparent_temperature: 34.2,
          relative_humidity_2m: 70,
          weather_code: 2,
          wind_speed_10m: 8,
        },
        hourly: {
          time: Array.from({ length: 8 }, (_, index) => `2026-09-25T${String(index + 8).padStart(2, '0')}:00`),
          temperature_2m: [27, 28, 29, 30, 31, 32, 31, 30],
          precipitation_probability: [0, 10, 20, 30, 40, 50, 60, 70],
          weather_code: [1, 2, 3, 61, 2, 1, 3, 61],
        },
        daily: {
          time: ['2026-09-25'],
          weather_code: [2],
          temperature_2m_max: [32],
          temperature_2m_min: [24],
          precipitation_probability_max: [50],
        },
      }),
    });

    const forecast = await weatherService.forecast({ days: 1 });

    expect(forecast.actual.sensacion).toBe(34);
    expect(forecast.horario).toHaveLength(6);
    expect(forecast.horario[0]).toMatchObject({ hora: '10:00', temperatura: 29, lluvia: 20 });
    expect(forecast.horario[5].hora).toBe('15:00');
  });
});