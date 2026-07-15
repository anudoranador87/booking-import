import { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Filter, ChevronDown, Edit2, Trash2, Check, X, Calendar, User, DollarSign, Home, Coffee, Car, Layers } from 'lucide-react';
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

interface ReservationsListProps {
  reservations: Reservation[];
  onDeleteReservation?: (id: string) => void;
  onUpdateReservation?: (updatedRes: Reservation) => void;
}

export default function ReservationsList({
  reservations,
  onDeleteReservation,
  onUpdateReservation,
}: ReservationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editRoomType, setEditRoomType] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editTotalPrice, setEditTotalPrice] = useState('');
  const [editStatus, setEditStatus] = useState<'confirmed' | 'virtual' | 'unpaid'>('confirmed');
  const [editBreakfast, setEditBreakfast] = useState(false);
  const [editParking, setEditParking] = useState(false);
  const [editTriple, setEditTriple] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.includes(searchTerm) ||
      res.roomNumber.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const startEditing = (res: Reservation) => {
    setEditingId(res.id);
    setEditGuestName(res.guestName);
    setEditRoomNumber(res.roomNumber);
    setEditRoomType(res.roomType);
    setEditCheckIn(res.checkIn);
    setEditCheckOut(res.checkOut);
    setEditTotalPrice(res.totalPrice);
    setEditStatus(res.status);
    setEditBreakfast(res.breakfast);
    setEditParking(res.parking);
    setEditTriple(res.triple);
    setEditNotes(res.notes || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editGuestName.trim() || !editRoomNumber.trim() || !editCheckIn.trim() || !editCheckOut.trim()) {
      toast.error('Por favor, rellena todos los campos obligatorios');
      return;
    }

    if (onUpdateReservation) {
      onUpdateReservation({
        id,
        guestName: editGuestName,
        roomNumber: editRoomNumber,
        roomType: editRoomType || 'Estándar',
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        totalPrice: editTotalPrice || '0,00 €',
        status: editStatus,
        breakfast: editBreakfast,
        parking: editParking,
        triple: editTriple,
        notes: editNotes,
      });
      setEditingId(null);
      toast.success('Reserva actualizada correctamente');
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteReservation) {
      onDeleteReservation(id);
      if (expandedId === id) setExpandedId(null);
      toast.success('Reserva eliminada correctamente');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-accent text-accent-foreground border-none">Confirmado</Badge>;
      case 'virtual':
        return <Badge className="bg-yellow-100 text-yellow-800 border-none">Virtual</Badge>;
      case 'unpaid':
        return <Badge className="bg-destructive/10 text-destructive border-none">Sin Pagar</Badge>;
      default:
        return null;
    }
  };

  const getExtrasDisplay = (res: Reservation) => {
    const extras = [];
    if (res.breakfast) extras.push('D');
    if (res.parking) extras.push('P');
    if (res.triple) extras.push('S');
    return extras.length > 0 ? extras.join(', ') : '-';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, número de reserva o habitación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="virtual">Virtuales</SelectItem>
            <SelectItem value="unpaid">Sin Pagar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {filteredReservations.length} de {reservations.length} reservas
      </p>

      {/* Reservations Table */}
      {filteredReservations.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Huésped</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Habitación</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Entrada</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Salida</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Extras</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Estado</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => {
                const isExpanded = expandedId === res.id;
                const isEditing = editingId === res.id;
                
                return (
                  <Fragment key={res.id}>
                    <tr
                      className={`border-b border-border hover:bg-secondary/20 transition-colors ${
                        isExpanded ? 'bg-secondary/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{res.guestName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{res.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{res.roomNumber}</div>
                        <div className="text-xs text-muted-foreground">{res.roomType}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">{res.checkIn}</td>
                      <td className="px-4 py-3 font-mono text-foreground">{res.checkOut}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-primary">
                        {getExtrasDisplay(res)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{res.totalPrice}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(res.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setExpandedId(isExpanded ? null : res.id);
                            if (isExpanded) cancelEditing();
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </td>
                    </tr>
                    
                    {/* Expanded panel */}
                    {isExpanded && (
                      <tr className="bg-secondary/5 border-b border-border">
                        <td colSpan={8} className="p-0">
                          <div className="p-6 space-y-4 border-l-4 border-l-primary/40">
                            {isEditing ? (
                              /* EDITING MODE FORM */
                              <div className="space-y-4">
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <Edit2 className="h-4 w-4 text-primary" />
                                  Modificar Reserva
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Huésped</label>
                                    <Input
                                      value={editGuestName}
                                      onChange={(e) => setEditGuestName(e.target.value)}
                                      placeholder="Nombre del huésped"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Habitación</label>
                                    <Input
                                      value={editRoomNumber}
                                      onChange={(e) => setEditRoomNumber(e.target.value)}
                                      placeholder="Ej: 101"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo</label>
                                    <Input
                                      value={editRoomType}
                                      onChange={(e) => setEditRoomType(e.target.value)}
                                      placeholder="Ej: Doble Estándar"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Check-In</label>
                                    <Input
                                      value={editCheckIn}
                                      onChange={(e) => setEditCheckIn(e.target.value)}
                                      placeholder="DD/MM/YYYY"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Check-Out</label>
                                    <Input
                                      value={editCheckOut}
                                      onChange={(e) => setEditCheckOut(e.target.value)}
                                      placeholder="DD/MM/YYYY"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Precio Total</label>
                                    <Input
                                      value={editTotalPrice}
                                      onChange={(e) => setEditTotalPrice(e.target.value)}
                                      placeholder="Ej: 200,00 €"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                  {/* Select Status */}
                                  <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Estado del Pago</label>
                                    <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                                      <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="Selecciona estado" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="confirmed">Confirmado</SelectItem>
                                        <SelectItem value="virtual">Virtual</SelectItem>
                                        <SelectItem value="unpaid">Sin Pagar</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Checkbox Extras */}
                                  <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase block">Extras Incluidos</label>
                                    <div className="flex flex-wrap gap-4 pt-1">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`edit-breakfast-${res.id}`}
                                          checked={editBreakfast}
                                          onCheckedChange={(checked) => setEditBreakfast(!!checked)}
                                        />
                                        <label htmlFor={`edit-breakfast-${res.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                                          Desayuno (D)
                                        </label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`edit-parking-${res.id}`}
                                          checked={editParking}
                                          onCheckedChange={(checked) => setEditParking(!!checked)}
                                        />
                                        <label htmlFor={`edit-parking-${res.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                                          Parking (P)
                                        </label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`edit-triple-${res.id}`}
                                          checked={editTriple}
                                          onCheckedChange={(checked) => setEditTriple(!!checked)}
                                        />
                                        <label htmlFor={`edit-triple-${res.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                                          Habitación Triple (S)
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-muted-foreground uppercase">Notas de Reserva</label>
                                  <Textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Añade notas del huésped, solicitudes especiales..."
                                    className="bg-background min-h-20"
                                  />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                  </Button>
                                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white" onClick={() => saveEdit(res.id)}>
                                    <Check className="mr-2 h-4 w-4" /> Guardar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* VIEW DETAILS MODE */
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                      <User className="h-3.5 w-3.5 text-primary" />
                                      Huésped Completo
                                    </div>
                                    <p className="text-foreground font-semibold text-sm">{res.guestName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                      <Home className="h-3.5 w-3.5 text-primary" />
                                      Asignación de Habitación
                                    </div>
                                    <p className="text-foreground">Habitación {res.roomNumber} ({res.roomType})</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                      <Calendar className="h-3.5 w-3.5 text-primary" />
                                      Estancia
                                    </div>
                                    <p className="text-foreground font-mono">{res.checkIn} al {res.checkOut}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                                      Precio Facturado
                                    </div>
                                    <p className="text-foreground font-bold text-sm text-primary">{res.totalPrice}</p>
                                  </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Servicios Extra</div>
                                      <div className="flex gap-2">
                                        {res.breakfast ? (
                                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1 border-none">
                                            <Coffee className="h-3.5 w-3.5" /> Desayuno
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-muted-foreground border-dashed">Sin Desayuno</Badge>
                                        )}
                                        {res.parking ? (
                                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 border-none">
                                            <Car className="h-3.5 w-3.5" /> Parking
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="text-muted-foreground border-dashed">Sin Parking</Badge>
                                        )}
                                        {res.triple ? (
                                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 flex items-center gap-1 border-none">
                                            <Layers className="h-3.5 w-3.5" /> Triple
                                          </Badge>
                                        ) : null}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notas y Solicitudes</div>
                                      <p className="text-xs text-foreground italic bg-secondary/35 p-2.5 rounded border border-border/50">
                                        {res.notes || 'Ninguna nota especial.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta acción no se puede deshacer. Se eliminará la reserva de <strong>{res.guestName}</strong> del listado local del hotel.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(res.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                                          Eliminar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button size="sm" variant="outline" onClick={() => startEditing(res)}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Editar Datos
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/10 border border-border rounded-lg">
          <p className="text-muted-foreground">No se encontraron reservas con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
