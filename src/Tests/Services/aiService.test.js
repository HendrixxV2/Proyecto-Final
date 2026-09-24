import { resumirTexto } from '@/Services/aiService';

describe('aiService.resumirTexto', () => {
  const texto =
    'La Galería Ferrocarril reabre sus puertas tras seis meses de restauración. ' +
    'La muestra reúne 48 fotografías donadas por familias orotinenses. ' +
    'El proyecto fue financiado con fondos municipales. ' +
    'Se espera recibir más de 3.000 visitantes durante el trimestre.';

  it('devuelve el mismo texto si tiene menos oraciones que el límite', () => {
    expect(resumirTexto('Una sola oración.', 2)).toBe('Una sola oración.');
  });

  it('reduce el contenido a la cantidad de oraciones solicitada', () => {
    const resumen = resumirTexto(texto, 2);
    const oraciones = resumen.split(/(?<=[.!?])\s+/).filter(Boolean);

    expect(oraciones).toHaveLength(2);
    expect(resumen.length).toBeLessThan(texto.length);
  });

  it('mantiene el orden original de las oraciones seleccionadas', () => {
    const resumen = resumirTexto(texto, 2);
    expect(resumen.startsWith('La Galería Ferrocarril')).toBe(true);
  });
});