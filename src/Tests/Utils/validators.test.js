import { validateForm, required, email, min, rangoHorarioValido, isFutureDate } from '@/Utils/validators';

describe('validators', () => {
  it('detecta correos válidos e inválidos', () => {
    expect(email()('persona@orotina.cr')).toBeNull();
    expect(email()('correo-invalido')).toMatch(/inválido/i);
  });

  it('valida longitud mínima', () => {
    expect(min(6)('12345')).toMatch(/mínimo 6/i);
    expect(min(6)('123456')).toBeNull();
  });

  it('valida rangos horarios', () => {
    expect(rangoHorarioValido('09:00', '12:00')).toBe(true);
    expect(rangoHorarioValido('14:00', '10:00')).toBe(false);
    expect(rangoHorarioValido('25:00', '26:00')).toBe(false);
  });

  it('valida fechas futuras', () => {
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    expect(isFutureDate(ayer)).toBe(false);
    expect(isFutureDate(manana)).toBe(true);
  });

  it('devuelve errores por campo con validateForm', () => {
    const { errors, isValid } = validateForm(
      { nombre: '', email: 'mal' },
      { nombre: [required()], email: [required(), email()] },
    );

    expect(isValid).toBe(false);
    expect(errors.nombre).toBeDefined();
    expect(errors.email).toBeDefined();
  });
});