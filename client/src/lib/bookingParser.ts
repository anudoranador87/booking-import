/**
 * Módulo de parsing de emails de Booking.com
 * Extrae datos de confirmación de reservas usando expresiones regulares
 * 
 * Campos extraídos:
 * - Número de reserva
 * - Nombre del huésped
 * - Tipo de habitación
 * - Fecha de entrada
 * - Fecha de salida
 * - Precio por noche
 * - Total de la reserva
 * - Estado de pago
 * - Extras (desayuno, parking, tipo de habitación)
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

/**
 * Extrae el número de reserva del email
 */
function extractReservationNumber(text: string): string {
  const match = text.match(/(?:Booking Reference|Referencia de reserva|Reservation number)[\s:]*([A-Z0-9]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Extrae el nombre del huésped
 */
function extractGuestName(text: string): string {
  const match = text.match(/(?:Guest name|Nombre del huésped|Name)[\s:]*([A-Za-záéíóúñÁÉÍÓÚÑ\s]+)/i);
  return match ? match[1].trim() : 'Unknown';
}

/**
 * Extrae el tipo de habitación
 */
function extractRoomType(text: string): { type: string; number: string } {
  const match = text.match(/(?:Room type|Tipo de habitación)[\s:]*([A-Za-z\s]+)\s*\((\d+)\)/i);
  if (match) {
    return { type: match[1].trim(), number: match[2] };
  }
  const fallback = text.match(/(?:Room|Habitación)[\s:]*([A-Za-z\s]+)/i);
  return { type: fallback ? fallback[1].trim() : 'Standard', number: '101' };
}

/**
 * Extrae fechas en formato DD/MM/YYYY
 */
function extractDate(text: string, pattern: string): string {
  const regex = new RegExp(`${pattern}[\\s:]*([0-9]{1,2})/([0-9]{1,2})/([0-9]{4})`, 'i');
  const match = text.match(regex);
  if (match) {
    return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
  }
  return 'N/A';
}

/**
 * Extrae precios (soporta múltiples formatos: 89,00 €, $89.00, etc.)
 */
function extractPrice(text: string, pattern: string): string {
  const regex = new RegExp(`${pattern}[\\s:]*([€$]?\\s*[0-9]+[.,][0-9]{2})`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[1].trim();
  }
  return '0,00 €';
}

/**
 * Detecta si un extra está incluido
 */
function hasExtra(text: string, extraName: string): boolean {
  const patterns = {
    breakfast: /(?:breakfast|desayuno|breakfast included|desayuno incluido)/i,
    parking: /(?:parking|estacionamiento|parking included|parking incluido)/i,
    triple: /(?:triple|3 beds|tres camas|triple room)/i,
  };
  
  const pattern = patterns[extraName as keyof typeof patterns];
  if (!pattern) return false;
  
  return pattern.test(text);
}

/**
 * Detecta el estado de pago
 */
function extractPaymentStatus(text: string): 'virtual' | 'confirmed' | 'unpaid' {
  if (/virtual|virtual booking/i.test(text)) return 'virtual';
  if (/unpaid|sin pagar|no pagado/i.test(text)) return 'unpaid';
  return 'confirmed';
}

/**
 * Función principal: extrae todos los datos del email
 */
export function extractBookingData(emailText: string): BookingData {
  const roomInfo = extractRoomType(emailText);
  
  return {
    reservationNumber: extractReservationNumber(emailText),
    guestName: extractGuestName(emailText),
    roomType: roomInfo.type,
    roomNumber: roomInfo.number,
    checkInDate: extractDate(emailText, 'Check-in|Check in|Entrada|Check-in date'),
    checkOutDate: extractDate(emailText, 'Check-out|Check out|Salida|Check-out date'),
    pricePerNight: extractPrice(emailText, 'Price per night|Precio por noche|Nightly rate'),
    totalPrice: extractPrice(emailText, 'Total|Total price|Precio total'),
    paymentStatus: extractPaymentStatus(emailText),
    breakfast: hasExtra(emailText, 'breakfast'),
    parking: hasExtra(emailText, 'parking'),
    tripleRoom: hasExtra(emailText, 'triple'),
    notes: extractNotes(emailText),
  };
}

/**
 * Extrae notas adicionales
 */
function extractNotes(text: string): string {
  const match = text.match(/(?:Special requests|Solicitudes especiales|Notes|Notas)[\s:]*([^\n]+)/i);
  return match ? match[1].trim() : '';
}

/**
 * Valida que los datos extraídos sean válidos
 */
export function validateBookingData(data: BookingData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.reservationNumber || data.reservationNumber === 'N/A') {
    errors.push('Número de reserva no encontrado');
  }
  
  if (!data.guestName || data.guestName === 'Unknown') {
    errors.push('Nombre del huésped no encontrado');
  }
  
  if (data.checkInDate === 'N/A') {
    errors.push('Fecha de entrada no encontrada');
  }
  
  if (data.checkOutDate === 'N/A') {
    errors.push('Fecha de salida no encontrada');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
