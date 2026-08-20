import { describe, expect, it } from 'vitest';
import { extractBookingData, validateBookingData } from './bookingParser';

const sampleEmail = `
  Booking Reference: AB-12345
  Guest name: María López
  Room type: Double Room (204)
  Check-in date: 05/09/2026
  Check-out date: 08/09/2026
  Price per night: 89,00 €
  Total price: 267,00 €
  Payment: pending payment
  Breakfast included
  Special requests: Late arrival
`;

describe('bookingParser', () => {
  it('extrae los campos principales de un email bilingüe', () => {
    const result = extractBookingData(sampleEmail);

    expect(result).toMatchObject({
      reservationNumber: 'AB-12345',
      guestName: 'María López',
      roomType: 'Double Room',
      roomNumber: '204',
      checkInDate: '05/09/2026',
      checkOutDate: '08/09/2026',
      pricePerNight: '89,00 €',
      totalPrice: '267,00 €',
      paymentStatus: 'unpaid',
      breakfast: true,
      parking: false,
      notes: 'Late arrival',
    });
  });

  it('acepta separadores de fecha alternativos', () => {
    const result = extractBookingData(
      'Referencia de reserva: XY99\nNombre del huésped: Ana Ruiz\nEntrada: 1-10-2026\nSalida: 3.10.2026',
    );

    expect(result.checkInDate).toBe('01/10/2026');
    expect(result.checkOutDate).toBe('03/10/2026');
    expect(validateBookingData(result).valid).toBe(true);
  });

  it('rechaza fechas imposibles y estancias invertidas', () => {
    const invalidDate = extractBookingData(
      'Booking Reference: TEST1\nGuest name: Alex Smith\nCheck-in: 31/02/2026\nCheck-out: 01/03/2026',
    );
    expect(validateBookingData(invalidDate).errors).toContain('Fecha de entrada no válida');

    const reversedStay = extractBookingData(
      'Booking Reference: TEST2\nGuest name: Alex Smith\nCheck-in: 10/09/2026\nCheck-out: 08/09/2026',
    );
    expect(validateBookingData(reversedStay).errors).toContain(
      'La fecha de salida debe ser posterior a la fecha de entrada',
    );
  });

  it('mantiene valores seguros cuando faltan campos', () => {
    const result = extractBookingData('Mensaje sin estructura reconocible');
    const validation = validateBookingData(result);

    expect(result.reservationNumber).toBe('N/A');
    expect(result.guestName).toBe('Unknown');
    expect(validation.valid).toBe(false);
    expect(validation.errors).toHaveLength(4);
  });
});
