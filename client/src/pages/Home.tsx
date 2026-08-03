import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  Moon,
  Sun,
  Hotel,
  BarChart3,
  Mail,
  BedDouble,
  Activity,
  ArrowUpRight,
  Zap,
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
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color: 'blue' | 'green' | 'red' | 'purple';
  icon: React.ReactNode;
  description?: string;
  delay?: number;
}

function KpiCard({ label, value, suffix = '', prefix = '', color, icon, description, delay = 0 }: KpiCardProps) {
  const count = useCountUp(value, 1000 + delay);
  const displayValue = prefix + (suffix === '€' 
    ? count.toFixed(2).replace('.', ',') 
    : count.toString()) + (suffix && suffix !== '€' ? suffix : suffix === '€' ? ' €' : '');

  return (
    <div
      className={`kpi-card kpi-card-${color} shadow-glow-${color} animate-slide-up stagger-${delay / 50 + 1}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon badge */}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
          {icon}
        </div>
        <div className="bg-white/10 rounded-lg px-2 py-1 flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 text-white/70" />
          <span className="text-white/70 text-xs font-medium">Live</span>
        </div>
      </div>
      {/* Value */}
      <div className="relative z-10">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-bold text-3xl leading-tight animate-count-up">
          {displayValue}
        </p>
        {description && (
          <p className="text-white/60 text-xs mt-1.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
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

  const isDark = theme === 'dark';

  const tabConfig = [
    { value: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'parser', label: 'Parser Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'planning', label: 'Planning Visual', icon: <BedDouble className="h-4 w-4" /> },
    { value: 'sheets', label: 'Google Sheets', icon: <FileSpreadsheet className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* ===== HEADER ===== */}
      <header className="app-header sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-2.5 border border-white/20 shadow-lg">
                <Hotel className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-display text-2xl text-white leading-tight">
                  Booking Import
                </h1>
                <p className="text-white/60 text-xs font-medium tracking-wide">
                  Hotel Management · Powered by AI
                </p>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 relative z-10">
              {/* Dark mode toggle */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                <Sun className="h-4 w-4 text-white/70" />
                <Switch
                  id="dark-mode-toggle"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/20"
                />
                <Moon className="h-4 w-4 text-white/70" />
              </div>

              {/* Nueva Reserva button */}
              <Button
                onClick={() => setIsManualOpen(true)}
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg border-none gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Reserva
              </Button>
            </div>
          </div>

          {/* Nav Tabs inside header */}
          <div className="flex items-center gap-1 mt-4 relative z-10">
            {tabConfig.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.value
                    ? 'bg-white text-primary shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="container py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <KpiCard
            label="Total de Reservas"
            value={stats.totalReservations}
            color="blue"
            icon={<Users className="h-6 w-6 text-white" />}
            description="Todas las estancias registradas"
            delay={0}
          />
          <KpiCard
            label="Confirmadas"
            value={stats.confirmedReservations}
            color="green"
            icon={<CheckCircle2 className="h-6 w-6 text-white" />}
            description="Reservas activas y pagadas"
            delay={50}
          />
          <KpiCard
            label="Pendientes de Pago"
            value={stats.pendingPayment}
            color="red"
            icon={<AlertCircle className="h-6 w-6 text-white" />}
            description="Requieren atención inmediata"
            delay={100}
          />
          <KpiCard
            label="Ingresos Totales"
            value={stats.totalRevenue}
            suffix="€"
            color="purple"
            icon={<DollarSign className="h-6 w-6 text-white" />}
            description="Facturación acumulada"
            delay={150}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Charts */}
              {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <Card className="p-6 shadow-soft bg-card border-border transition-colors">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      <div className="bg-primary/10 rounded-lg p-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      Ingresos por Habitación
                    </h3>
                    <p className="text-xs text-muted-foreground mb-5">Desglose de facturación por unidad</p>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'} />
                          <XAxis dataKey="room" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDark ? '#0F1629' : '#fff', 
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              color: isDark ? '#E2E8F0' : '#0F172A'
                            }}
                            formatter={(value: any) => [`${parseFloat(value).toFixed(2)} €`, 'Ingresos']}
                          />
                          <Area type="monotone" dataKey="Ingresos" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" dot={{ fill: '#2563EB', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Nights Chart */}
                  <Card className="p-6 shadow-soft bg-card border-border transition-colors">
                    <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                      <div className="bg-accent/10 rounded-lg p-1.5">
                        <Activity className="h-4 w-4 text-accent" />
                      </div>
                      Noches Reservadas
                    </h3>
                    <p className="text-xs text-muted-foreground mb-5">Ocupación por habitación</p>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorNoches" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#047857" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'} />
                          <XAxis dataKey="room" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDark ? '#0F1629' : '#fff', 
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                              color: isDark ? '#E2E8F0' : '#0F172A'
                            }}
                            formatter={(value: any) => [`${value} noches`, 'Ocupación']}
                          />
                          <Bar dataKey="Noches" fill="url(#colorNoches)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {/* Reservations Table */}
              <Card className="p-6 shadow-soft bg-card border-border transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Listado de Reservas</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Gestiona y edita las reservas en tiempo real</p>
                  </div>
                  <div className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
                    {reservations.length} reservas
                  </div>
                </div>
                <ReservationsList
                  reservations={reservations}
                  onDeleteReservation={handleDeleteReservation}
                  onUpdateReservation={handleUpdateReservation}
                />
              </Card>
            </div>
          )}

          {/* Parser Tab */}
          {activeTab === 'parser' && (
            <ParserView onAddReservation={handleAddReservation} />
          )}

          {/* Planning Tab */}
          {activeTab === 'planning' && (
            <OccupancyPlanning reservations={reservations} />
          )}

          {/* Sheets Tab */}
          {activeTab === 'sheets' && (
            <GoogleSheetsSync reservations={reservations} />
          )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== MANUAL RESERVATION DIALOG ===== */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="max-w-md bg-card rounded-2xl shadow-2xl border border-border p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary/10 rounded-xl p-2">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">Crear Reserva Manual</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Introduce los datos del huésped para registrar la reserva directamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Huésped *</label>
              <Input
                placeholder="Nombre completo"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Habitación *</label>
                <Input
                  placeholder="Ej: 101"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</label>
                <Input
                  placeholder="Ej: Doble Estándar"
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entrada *</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Salida *</label>
                <Input
                  placeholder="DD/MM/YYYY"
                  value={newCheckOut}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Precio Total *</label>
                <Input
                  placeholder="Ej: 240,00 €"
                  value={newTotalPrice}
                  onChange={(e) => setNewTotalPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</label>
                <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">✅ Confirmado</SelectItem>
                    <SelectItem value="virtual">🟡 Virtual</SelectItem>
                    <SelectItem value="unpaid">🔴 Sin Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Extras Incluidos</label>
              <div className="flex flex-wrap gap-4 pt-1 bg-secondary/30 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-breakfast"
                    checked={newBreakfast}
                    onCheckedChange={(checked) => setNewBreakfast(!!checked)}
                  />
                  <label htmlFor="new-breakfast" className="text-xs font-medium text-foreground cursor-pointer">
                    ☕ Desayuno
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-parking"
                    checked={newParking}
                    onCheckedChange={(checked) => setNewParking(!!checked)}
                  />
                  <label htmlFor="new-parking" className="text-xs font-medium text-foreground cursor-pointer">
                    🚗 Parking
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-triple"
                    checked={newTriple}
                    onCheckedChange={(checked) => setNewTriple(!!checked)}
                  />
                  <label htmlFor="new-triple" className="text-xs font-medium text-foreground cursor-pointer">
                    🛏 Triple
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans">Notas especiales</label>
              <Textarea
                placeholder="Peticiones especiales del huésped..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="min-h-16 bg-background"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsManualOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveManual} className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2">
              <Zap className="h-4 w-4" />
              Registrar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
