import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  FileSpreadsheet,
  TrendingUp,
  Percent,
} from 'lucide-react';
import ParserView from '@/components/ParserView';
import ReservationsList from '@/components/ReservationsList';
import OccupancyPlanning from '@/components/OccupancyPlanning';
import GoogleSheetsSync from '@/components/GoogleSheetsSync';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reservations, setReservations] = useState<any[]>([
    {
      id: '4521893076',
      guestName: 'Ana Martínez García',
      roomNumber: '102',
      roomType: 'Doble Superior',
      checkIn: '12/06/2026',
      checkOut: '15/06/2026',
      totalPrice: '267,00 €',
      status: 'confirmed',
      breakfast: true,
      parking: false,
      triple: false,
      notes: 'Habitación silenciosa, piso alto si es posible',
    },
    {
      id: '4521893077',
      guestName: 'Carlos López Fernández',
      roomNumber: '201',
      roomType: 'Suite Deluxe',
      checkIn: '13/06/2026',
      checkOut: '16/06/2026',
      totalPrice: '450,00 €',
      status: 'virtual',
      breakfast: true,
      parking: true,
      triple: false,
      notes: 'Llegada tardía estimada sobre las 22:00',
    },
    {
      id: '4521893078',
      guestName: 'María González Ruiz',
      roomNumber: '103',
      roomType: 'Doble Estándar',
      checkIn: '14/06/2026',
      checkOut: '17/06/2026',
      totalPrice: '178,50 €',
      status: 'unpaid',
      breakfast: false,
      parking: true,
      triple: false,
      notes: 'Se necesita cuna para bebé',
    },
  ]);

  // Dialog State
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('Doble Estándar');
  const [newCheckIn, setNewCheckIn] = useState('15/06/2026');
  const [newCheckOut, setNewCheckOut] = useState('18/06/2026');
  const [newTotalPrice, setNewTotalPrice] = useState('240,00 €');
  const [newStatus, setNewStatus] = useState<'confirmed' | 'virtual' | 'unpaid'>('confirmed');
  const [newBreakfast, setNewBreakfast] = useState(false);
  const [newParking, setNewParking] = useState(false);
  const [newTriple, setNewTriple] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Stats
  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
    const unpaid = reservations.filter((r) => r.status === 'unpaid').length;
    const revenue = reservations.reduce((sum, r) => {
      const price = parseFloat(r.totalPrice.replace(/[^0-9,]/g, '').replace(',', '.'));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return {
      totalReservations: total,
      confirmedReservations: confirmed,
      pendingPayment: unpaid,
      totalRevenue: revenue,
    };
  }, [reservations]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    const dataMap: { [room: string]: { room: string; Ingresos: number; Noches: number } } = {};
    
    reservations.forEach((r) => {
      const room = r.roomNumber;
      if (!dataMap[room]) {
        dataMap[room] = { room: `Hab. ${room}`, Ingresos: 0, Noches: 0 };
      }
      
      const price = parseFloat(r.totalPrice.replace(/[^0-9,]/g, '').replace(',', '.'));
      dataMap[room].Ingresos += isNaN(price) ? 0 : price;

      const [d1, m1, y1] = r.checkIn.split('/').map(Number);
      const [d2, m2, y2] = r.checkOut.split('/').map(Number);
      const checkInDate = new Date(y1, m1 - 1, d1);
      const checkOutDate = new Date(y2, m2 - 1, d2);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      const nights = diffTime > 0 ? diffTime / (1000 * 60 * 60 * 24) : 1;
      
      dataMap[room].Noches += nights;
    });

    return Object.values(dataMap).sort((a, b) => a.room.localeCompare(b.room));
  }, [reservations]);

  const handleAddReservation = (newReservation: any) => {
    setReservations((prev) => [newReservation, ...prev]);
    toast.success('Reserva añadida correctamente');
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateReservation = (updatedRes: any) => {
    setReservations((prev) => prev.map((r) => (r.id === updatedRes.id ? updatedRes : r)));
  };

  const handleSaveManual = () => {
    if (!newGuestName.trim() || !newRoomNumber.trim() || !newCheckIn.trim() || !newCheckOut.trim()) {
      toast.error('Por favor, rellena todos los campos obligatorios');
      return;
    }

    const randomId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newRes = {
      id: randomId,
      guestName: newGuestName,
      roomNumber: newRoomNumber,
      roomType: newRoomType,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      totalPrice: newTotalPrice,
      status: newStatus,
      breakfast: newBreakfast,
      parking: newParking,
      triple: newTriple,
      notes: newNotes,
    };

    handleAddReservation(newRes);
    setIsManualOpen(false);

    // Reset Form
    setNewGuestName('');
    setNewRoomNumber('');
    setNewRoomType('Doble Estándar');
    setNewCheckIn('15/06/2026');
    setNewCheckOut('18/06/2026');
    setNewTotalPrice('240,00 €');
    setNewStatus('confirmed');
    setNewBreakfast(false);
    setNewParking(false);
    setNewTriple(false);
    setNewNotes('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white shadow-soft">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-3xl text-foreground">Booking Import</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Automatiza la importación de reservas de Booking.com a Google Sheets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsManualOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Reserva Manual
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Reservas</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.totalReservations}</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="mt-2 text-3xl font-bold text-accent">{stats.confirmedReservations}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-accent/20" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes de Pago</p>
                <p className="mt-2 text-3xl font-bold text-destructive">{stats.pendingPayment}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {stats.totalRevenue.toFixed(2)}€
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="parser">Parser de Email</TabsTrigger>
            <TabsTrigger value="planning">Planning Visual</TabsTrigger>
            <TabsTrigger value="sheets">Sincronización Sheets</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Visual Charts Section */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue per room Chart */}
                <Card className="p-6 shadow-soft">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Ingresos Generados por Habitación
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="room" stroke="#6B7280" fontSize={12} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                          formatter={(value: any) => [`${parseFloat(value).toFixed(2)} €`, 'Ingresos']}
                        />
                        <Area type="monotone" dataKey="Ingresos" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Nights per room Chart */}
                <Card className="p-6 shadow-soft">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-accent" />
                    Noches Reservadas por Habitación
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="room" stroke="#6B7280" fontSize={12} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                          formatter={(value: any) => [`${value} noches`, 'Reservado']}
                        />
                        <Bar dataKey="Noches" fill="#10B981" radius={[4, 4, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            <Card className="p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-foreground mb-4">Listado de Reservas</h2>
              <ReservationsList
                reservations={reservations}
                onDeleteReservation={handleDeleteReservation}
                onUpdateReservation={handleUpdateReservation}
              />
            </Card>
          </TabsContent>

          {/* Parser Tab */}
          <TabsContent value="parser" className="space-y-6">
            <ParserView onAddReservation={handleAddReservation} />
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <OccupancyPlanning reservations={reservations} />
          </TabsContent>

          {/* Sheets Tab */}
          <TabsContent value="sheets" className="space-y-6">
            <GoogleSheetsSync reservations={reservations} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Manual Reservation Dialog */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-lg border border-border p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Crear Reserva Manual</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Introduce los datos del huésped para registrar la reserva directamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Huésped *</label>
              <Input
                placeholder="Nombre completo"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Habitación *</label>
                <Input
                  placeholder="Ej: 101"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tipo Habitación</label>
                <Input
                  placeholder="Ej: Doble Estándar"
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha Entrada *</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha Salida *</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={newCheckOut}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Precio Total *</label>
                <Input
                  placeholder="Ej: 240,00 €"
                  value={newTotalPrice}
                  onChange={(e) => setNewTotalPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Estado del Pago</label>
                <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="unpaid">Sin Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase block">Extras Incluidos</label>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-breakfast"
                    checked={newBreakfast}
                    onCheckedChange={(checked) => setNewBreakfast(!!checked)}
                  />
                  <label htmlFor="new-breakfast" className="text-xs font-medium text-foreground cursor-pointer">
                    Desayuno (D)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-parking"
                    checked={newParking}
                    onCheckedChange={(checked) => setNewParking(!!checked)}
                  />
                  <label htmlFor="new-parking" className="text-xs font-medium text-foreground cursor-pointer">
                    Parking (P)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-triple"
                    checked={newTriple}
                    onCheckedChange={(checked) => setNewTriple(!!checked)}
                  />
                  <label htmlFor="new-triple" className="text-xs font-medium text-foreground cursor-pointer">
                    Habitación Triple (S)
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase font-sans">Notas / Peticiones Especiales</label>
              <Textarea
                placeholder="Notas adicionales..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="min-h-16"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsManualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveManual} className="bg-primary hover:bg-primary/90 text-white font-medium">
              Registrar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
