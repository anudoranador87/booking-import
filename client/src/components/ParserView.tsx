import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { extractBookingData, validateBookingData, BookingData } from '@/lib/bookingParser';
import { AlertCircle, CheckCircle2, Copy, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_EMAILS = {
  ana: `BOOKING REFERENCE: 4521893076
Guest name: Ana Martínez García
Room type: Doble Superior (102)
Check-in date: 12/06/2026
Check-out date: 15/06/2026
Price per night: 89,00 €
Total price: 267,00 €
Payment status: Virtual
Breakfast included: Yes
Parking: No
Special requests: Quiet room, high floor if possible`,

  carlos: `BOOKING REFERENCE: 4521893077
Guest name: Carlos López Fernández
Room type: Suite Deluxe (201)
Check-in date: 13/06/2026
Check-out date: 16/06/2026
Price per night: 150,00 €
Total price: 450,00 €
Payment status: Virtual booking
Breakfast included: Yes
Parking: Yes
Special requests: Late check-in expected around 22:00`,

  maria: `BOOKING REFERENCE: 4521893078
Guest name: María González Ruiz
Room type: Doble Estándar (103)
Check-in date: 14/06/2026
Check-out date: 17/06/2026
Price per night: 59,50 €
Total price: 178,50 €
Payment status: Unpaid
Breakfast included: No
Parking: Yes
Special requests: Crib needed for baby`,

  juan: `BOOKING REFERENCE: 4521893079
Guest name: Juan Rodríguez Martínez
Room type: Triple Room (301)
Check-in date: 15/06/2026
Check-out date: 18/06/2026
Price per night: 120,00 €
Total price: 360,00 €
Payment status: Confirmed
Breakfast included: Yes
Parking: Yes
Triple room: Yes
Special requests: Family traveling with two children`
};

interface ParserViewProps {
  onAddReservation: (reservation: any) => void;
}

export default function ParserView({ onAddReservation }: ParserViewProps) {
  const [emailText, setEmailText] = useState('');
  const [extractedData, setExtractedData] = useState<BookingData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    if (!emailText.trim()) {
      setErrors(['Por favor, pega el contenido del email de Booking']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const data = extractBookingData(emailText);
      const validation = validateBookingData(data);

      if (!validation.valid) {
        setErrors(validation.errors);
        setExtractedData(null);
      } else {
        setExtractedData(data);
        setErrors([]);
      }
    } catch (error) {
      setErrors(['Error al procesar el email. Verifica que sea un email válido de Booking.']);
      setExtractedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddReservation = () => {
    if (!extractedData) return;

    const reservation = {
      id: extractedData.reservationNumber,
      guestName: extractedData.guestName,
      roomNumber: extractedData.roomNumber,
      roomType: extractedData.roomType,
      checkIn: extractedData.checkInDate,
      checkOut: extractedData.checkOutDate,
      totalPrice: extractedData.totalPrice,
      status: extractedData.paymentStatus,
      breakfast: extractedData.breakfast,
      parking: extractedData.parking,
      triple: extractedData.tripleRoom,
      notes: extractedData.notes,
    };

    onAddReservation(reservation);
    setEmailText('');
    setExtractedData(null);
  };

  const handleClear = () => {
    setEmailText('');
    setExtractedData(null);
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pegar Email de Booking</h3>
        
        {/* Botones de Email de Prueba */}
        <div className="mb-4 bg-secondary/20 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Cargar Plantillas de Prueba (Emails de Ejemplo):
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmailText(SAMPLE_EMAILS.ana);
                toast.info('Cargado email de prueba de Ana Martínez');
              }}
              className="text-xs py-1 h-7"
            >
              Ana Martínez (Desayuno)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmailText(SAMPLE_EMAILS.carlos);
                toast.info('Cargado email de prueba de Carlos López');
              }}
              className="text-xs py-1 h-7"
            >
              Carlos López (Virtual)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmailText(SAMPLE_EMAILS.maria);
                toast.info('Cargado email de prueba de María González');
              }}
              className="text-xs py-1 h-7"
            >
              María González (Sin Pagar)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmailText(SAMPLE_EMAILS.juan);
                toast.info('Cargado email de prueba de Juan Rodríguez');
              }}
              className="text-xs py-1 h-7"
            >
              Juan Rodríguez (Triple)
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Copia y pega aquí el contenido completo del email de confirmación de Booking.com o selecciona un ejemplo de arriba..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="min-h-48 font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleParse}
              disabled={isProcessing || !emailText.trim()}
              className="flex-1"
            >
              {isProcessing ? 'Procesando...' : 'Extraer Datos'}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Extracted Data */}
      {extractedData && (
        <Card className="p-6 shadow-soft border-l-4 border-l-accent">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Datos Extraídos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Número de Reserva
                </label>
                <p className="mt-1 text-lg font-mono font-semibold text-foreground">
                  {extractedData.reservationNumber}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nombre del Huésped
                </label>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {extractedData.guestName}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Tipo de Habitación
                </label>
                <p className="mt-1 text-foreground">
                  {extractedData.roomType} ({extractedData.roomNumber})
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Fecha de Entrada
                </label>
                <p className="mt-1 text-foreground font-mono">{extractedData.checkInDate}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Fecha de Salida
                </label>
                <p className="mt-1 text-foreground font-mono">{extractedData.checkOutDate}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Precio por Noche
                </label>
                <p className="mt-1 text-foreground">{extractedData.pricePerNight}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Total
                </label>
                <p className="mt-1 text-lg font-bold text-primary">{extractedData.totalPrice}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Estado de Pago
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      extractedData.paymentStatus === 'confirmed'
                        ? 'bg-accent/10 text-accent'
                        : extractedData.paymentStatus === 'virtual'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {extractedData.paymentStatus === 'confirmed'
                      ? 'Confirmado'
                      : extractedData.paymentStatus === 'virtual'
                        ? 'Virtual'
                        : 'Sin Pagar'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Extras */}
          <div className="mb-6 pb-6 border-b border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-3">
              Extras Incluidos
            </label>
            <div className="flex flex-wrap gap-2">
              {extractedData.breakfast && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  D - Desayuno
                </span>
              )}
              {extractedData.parking && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  P - Parking
                </span>
              )}
              {extractedData.tripleRoom && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  S - Habitación Triple
                </span>
              )}
              {!extractedData.breakfast && !extractedData.parking && !extractedData.tripleRoom && (
                <span className="text-sm text-muted-foreground italic">Sin extras</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {extractedData.notes && (
            <div className="mb-6 pb-6 border-b border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                Notas
              </label>
              <p className="text-foreground">{extractedData.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleAddReservation} className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Agregar a Reservas
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
              }}
              variant="outline"
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar JSON
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
