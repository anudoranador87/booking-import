/**
 * Parser tolerante para emails de confirmación de Booking.com.
 *
 * El parser devuelve valores seguros aunque falten campos y la validación
 * separa los datos extraídos de las decisiones que requieren revisión humana.
 */

export interface BookingData {
  reservationNumber: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: string;
  totalPrice: string;
  paymentStatus: 'virtual' | 'confirmed' | 'unpaid';
  breakfast: boolean;
  parking: boolean;
  tripleRoom: boolean;
  notes: string;
}

const UNKNOWN = 'N/A';
const UNKNOWN_GUEST = 'Unknown';

function normalizeText(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/\r\n?/g, '\n');
}

function extractReservationNumber(text: string): string {
  const match = text.match(
    /(?:Booking Reference|Referencia de reserva|Reservation number|Número de reserva)[\s:#-]*([A-Z0-9-]+)/i,
  );
  return match?.[1]?.trim() || UNKNOWN;
}

function extractGuestName(text: string): string {
  const match = text.match(
    /(?:Guest name|Nombre del huésped|Guest|Name)[\s:]*([^\n]+)/i,
  );
  return match?.[1]?.trim() || UNKNOWN_GUEST;
}

function extractRoomType(text: string): { type: string; number: string } {
  const match = text.match(
    /(?:Room type|Tipo de habitación)[\s:]*([A-Za-záéíóúñÁÉÍÓÚÑ0-9\s-]+?)(?:\s*\((\d+)\))?(?:\n|$)/i,
  );

  if (match) {
    return { type: match[1].trim(), number: match[2] || UNKNOWN };
  }

  const fallback = text.match(/(?:Room|Habitación)[\s:]*([^\n]+)/i);
  return { type: fallback?.[1]?.trim() || 'Standard', number: UNKNOWN };
}

function extractDate(text: string, pattern: string): string {
  const regex = new RegExp(
    `(?:${pattern})[\\s:]*([0-9]{1,2})[./-]([0-9]{1,2})[./-]([0-9]{4})`,
    'i',
  );
  const match = text.match(regex);
  if (!match) return UNKNOWN;

  return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
}

function extractPrice(text: string, pattern: string): string {
  const regex = new RegExp(
    `(?:${pattern})[\\s:]*([€$£]?\\s*[0-9]+(?:[.,][0-9]{2})?\\s*[€$£]?)`,
    'i',
  );
  const match = text.match(regex);
  return match?.[1]?.trim() || '0,00 €';
}

function hasExtra(text: string, extraName: 'breakfast' | 'parking' | 'triple'): boolean {
  const patterns = {
    breakfast: /(?:breakfast|desayuno)(?:\s+included|\s+incluido)?/i,
    parking: /(?:parking|estacionamiento)(?:\s+included|\s+incluido)?/i,
    triple: /(?:triple|3 beds|tres camas|triple room)/i,
  };

  return patterns[extraName].test(text);
}

function extractPaymentStatus(text: string): BookingData['paymentStatus'] {
  if (/virtual(?:\s+card|\s+booking)?/i.test(text)) return 'virtual';
  if (/unpaid|sin pagar|no pagado|pending payment|pago pendiente/i.test(text)) return 'unpaid';
  return 'confirmed';
}

function extractNotes(text: string): string {
  const match = text.match(/(?:Special requests|Solicitudes especiales|Notes|Notas)[\s:]*([^\n]+)/i);
  return match?.[1]?.trim() || '';
}

export function extractBookingData(emailText: string): BookingData {
  const text = normalizeText(emailText);
  const roomInfo = extractRoomType(text);

  return {
    reservationNumber: extractReservationNumber(text),
    guestName: extractGuestName(text),
    roomType: roomInfo.type,
    roomNumber: roomInfo.number,
    checkInDate: extractDate(text, 'Check-in|Check in|Entrada|Check-in date'),
    checkOutDate: extractDate(text, 'Check-out|Check out|Salida|Check-out date'),
    pricePerNight: extractPrice(text, 'Price per night|Precio por noche|Nightly rate'),
    totalPrice: extractPrice(text, 'Total|Total price|Precio total'),
    paymentStatus: extractPaymentStatus(text),
    breakfast: hasExtra(text, 'breakfast'),
    parking: hasExtra(text, 'parking'),
    tripleRoom: hasExtra(text, 'triple'),
    notes: extractNotes(text),
  };
}

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

export function validateBookingData(data: BookingData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const checkIn = parseDate(data.checkInDate);
  const checkOut = parseDate(data.checkOutDate);

  if (!data.reservationNumber || data.reservationNumber === UNKNOWN) {
    errors.push('Número de reserva no encontrado');
  }
  if (!data.guestName || data.guestName === UNKNOWN_GUEST) {
    errors.push('Nombre del huésped no encontrado');
  }
  if (!checkIn) {
    errors.push('Fecha de entrada no válida');
  }
  if (!checkOut) {
    errors.push('Fecha de salida no válida');
  }
  if (checkIn && checkOut && checkIn >= checkOut) {
    errors.push('La fecha de salida debe ser posterior a la fecha de entrada');
  }

  return { valid: errors.length === 0, errors };
}
