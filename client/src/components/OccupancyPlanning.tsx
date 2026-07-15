import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRightLeft, User, Home, Key } from 'lucide-react';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: 'confirmed' | 'virtual' | 'unpaid';
  breakfast: boolean;
  parking: boolean;
  triple: boolean;
  notes?: string;
}

interface OccupancyPlanningProps {
  reservations: Reservation[];
  onUpdateReservation?: (updatedRes: Reservation) => void;
}

export default function OccupancyPlanning({ reservations, onUpdateReservation }: OccupancyPlanningProps) {
  const [daysToShow, setDaysToShow] = useState<number>(14);
  
  // Find min check-in date to set as initial start date
  const initialStartDate = useMemo(() => {
    if (reservations.length === 0) return new Date(2026, 5, 12); // June 12, 2026 default
    const dates = reservations.map(r => {
      const [d, m, y] = r.checkIn.split('/').map(Number);
      return new Date(y, m - 1, d);
    });
    return new Date(Math.min(...dates.map(d => d.getTime())));
  }, [reservations]);

  const [startDate, setStartDate] = useState<Date>(initialStartDate);

  // Reassignment Dialog State
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');

  // Generate date array to display
  const dates = useMemo(() => {
    const list: Date[] = [];
    const tempDate = new Date(startDate);
    for (let i = 0; i < daysToShow; i++) {
      list.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return list;
  }, [startDate, daysToShow]);

  // List of rooms (from reservations + some defaults to show hotel layout)
  const rooms = useMemo(() => {
    const defaultRooms = ['101', '102', '103', '104', '201', '202', '203', '301', '302'];
    const activeRooms = reservations.map(r => r.roomNumber);
    const combined = Array.from(new Set([...defaultRooms, ...activeRooms]));
    return combined.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [reservations]);

  // Check if a room is occupied on a specific date
  const getReservationForRoomOnDate = (roomNumber: string, date: Date) => {
    return reservations.find((res) => {
      const [checkInDay, checkInMonth, checkInYear] = res.checkIn.split('/').map(Number);
      const [checkOutDay, checkOutMonth, checkOutYear] = res.checkOut.split('/').map(Number);

      const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
      const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);

      // Strip time
      const checkInTime = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate()).getTime();
      const checkOutTime = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate()).getTime();
      const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

      return (
        res.roomNumber === roomNumber && dateTime >= checkInTime && dateTime < checkOutTime
      );
    });
  };

  const getExtrasIcons = (res: Reservation) => {
    const icons = [];
    if (res.breakfast) icons.push('D');
    if (res.parking) icons.push('P');
    if (res.triple) icons.push('S');
    return icons;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accent/15 border-l-4 border-l-accent hover:bg-accent/25';
      case 'virtual':
        return 'bg-yellow-100/50 border-l-4 border-l-yellow-400 hover:bg-yellow-100/70';
      case 'unpaid':
        return 'bg-destructive/10 border-l-4 border-l-destructive hover:bg-destructive/15';
      default:
        return 'bg-secondary/30';
    }
  };

  const navigateDates = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    const offset = direction === 'prev' ? -daysToShow : daysToShow;
    newDate.setDate(newDate.getDate() + offset);
    setStartDate(newDate);
  };

  const handleCellClick = (res: Reservation) => {
    setSelectedRes(res);
    setNewRoomNumber(res.roomNumber);
  };

  const handleReassign = () => {
    if (!selectedRes) return;
    if (!newRoomNumber.trim()) {
      toast.error('Por favor, indica un número de habitación');
      return;
    }

    if (onUpdateReservation) {
      onUpdateReservation({
        ...selectedRes,
        roomNumber: newRoomNumber,
      });
      toast.success(`Huésped ${selectedRes.guestName} reasignado a la Habitación ${newRoomNumber}`);
      setSelectedRes(null);
    }
  };

  return (
    <Card className="p-6 shadow-soft space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Planning Visual de Ocupación
          </h3>
          <p className="text-sm text-muted-foreground">
            Vista interactiva del hotel. Haz clic en una reserva para reasignar habitación.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDates('prev')}
              className="h-9 w-9 rounded-none border-r border-border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-xs font-mono font-semibold text-foreground">
              {startDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
              {' al '}
              {dates[dates.length - 1]?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDates('next')}
              className="h-9 w-9 rounded-none border-l border-border"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={daysToShow.toString()} onValueChange={(val) => setDaysToShow(Number(val))}>
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Días</SelectItem>
              <SelectItem value="14">14 Días</SelectItem>
              <SelectItem value="21">21 Días</SelectItem>
              <SelectItem value="30">30 Días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent/20 border-l-4 border-l-accent rounded-sm"></div>
          <span className="text-foreground font-medium">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100/50 border-l-4 border-l-yellow-400 rounded-sm"></div>
          <span className="text-foreground font-medium">Virtual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive/10 border-l-4 border-l-destructive rounded-sm"></div>
          <span className="text-foreground font-medium">Sin Pagar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-dashed border-muted-foreground/30 rounded-sm"></div>
          <span className="text-muted-foreground">Disponible / Vacío</span>
        </div>
      </div>

      {/* Planning Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-secondary/80 px-3 py-3 text-left font-semibold text-foreground border border-border w-24 backdrop-blur-sm shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                Habitación
              </th>
              {dates.map((date, idx) => {
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <th
                    key={idx}
                    className={`px-2 py-2.5 text-center font-semibold text-foreground border border-border min-w-28 ${
                      isToday ? 'bg-primary/10 border-primary/30' : 'bg-secondary/40'
                    }`}
                  >
                    <div className="font-mono text-xs">{date.getDate()}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((roomNumber) => (
              <tr key={roomNumber} className="hover:bg-secondary/5 transition-colors">
                <td className="sticky left-0 z-10 bg-white font-bold text-foreground border border-border px-3 py-3 text-left shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  Hab. {roomNumber}
                </td>
                {dates.map((date, idx) => {
                  const reservation = getReservationForRoomOnDate(roomNumber, date);
                  return (
                    <td
                      key={idx}
                      onClick={() => reservation && handleCellClick(reservation)}
                      className={`px-2 py-2 border border-border min-w-28 transition-colors ${
                        reservation
                          ? `${getStatusColor(reservation.status)} cursor-pointer`
                          : 'bg-background hover:bg-secondary/10'
                      }`}
                    >
                      {reservation ? (
                        <div className="space-y-1 select-none">
                          <div className="font-semibold text-foreground text-xs leading-tight truncate">
                            {reservation.guestName.split(' ')[0]} {reservation.guestName.split(' ')[1] || ''}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {getExtrasIcons(reservation).map((icon) => (
                              <span
                                key={icon}
                                className="inline-block text-[9px] px-1 bg-white/70 border border-border rounded font-bold"
                              >
                                {icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Habitaciones Activas</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {rooms.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Noches de Estancia Totales</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {reservations.reduce((sum, res) => {
              const [d1, m1, y1] = res.checkIn.split('/').map(Number);
              const [d2, m2, y2] = res.checkOut.split('/').map(Number);
              const checkIn = new Date(y1, m1 - 1, d1);
              const checkOut = new Date(y2, m2 - 1, d2);
              const diff = checkOut.getTime() - checkIn.getTime();
              return sum + (diff > 0 ? diff / (1000 * 60 * 60 * 24) : 1);
            }, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Valor del Inventario Reservado</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            €
            {reservations
              .reduce((sum, res) => {
                const price = parseFloat(res.totalPrice.replace(/[^0-9,]/g, '').replace(',', '.'));
                return sum + (isNaN(price) ? 0 : price);
              }, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Room Reassignment Dialog */}
      <Dialog open={selectedRes !== null} onOpenChange={(open) => !open && setSelectedRes(null)}>
        <DialogContent className="max-w-sm bg-white rounded-xl shadow-lg border border-border p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Reasignar Habitación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Cambia la habitación asignada para este huésped en el planning.
            </DialogDescription>
          </DialogHeader>

          {selectedRes && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <User className="h-3 w-3" /> Huésped
                </label>
                <p className="text-sm font-semibold text-foreground">{selectedRes.guestName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Key className="h-3 w-3" /> Habitación Actual
                  </label>
                  <p className="text-sm font-semibold text-foreground font-mono">Hab. {selectedRes.roomNumber}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Home className="h-3 w-3" /> Nueva Habitación
                  </label>
                  <Input
                    placeholder="Ej: 202"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Fechas de Estancia</label>
                <p className="text-xs text-foreground font-mono bg-secondary/30 p-2 rounded">
                  {selectedRes.checkIn} al {selectedRes.checkOut}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedRes(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleReassign} className="bg-primary hover:bg-primary/90 text-white">
              Guardar Reasignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
