import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, FileSpreadsheet, RefreshCw, CheckCircle, AlertTriangle, Link2, ExternalLink } from 'lucide-react';
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

interface GoogleSheetsSyncProps {
  reservations: Reservation[];
}

interface SyncLog {
  id: string;
  timestamp: string;
  recordCount: number;
  status: 'success' | 'failed';
  spreadsheetId: string;
}

export default function GoogleSheetsSync({ reservations }: GoogleSheetsSyncProps) {
  const [spreadsheetId, setSpreadsheetId] = useState('1aBcDeFgHiJkLmNoPqRsTuVwXyZ_BookingReservas');
  const [sheetName, setSheetName] = useState('Reservas');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  
  const [logs, setLogs] = useState<SyncLog[]>([
    {
      id: 'log-1',
      timestamp: '15/06/2026 10:30',
      recordCount: 2,
      status: 'success',
      spreadsheetId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_BookingReservas',
    },
    {
      id: 'log-2',
      timestamp: '14/06/2026 18:15',
      recordCount: 3,
      status: 'success',
      spreadsheetId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ_BookingReservas',
    }
  ]);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Conectado correctamente a Google Sheets');
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info('Se ha desconectado de Google Sheets');
  };

  const handleSync = () => {
    if (!isConnected) {
      toast.error('Debes conectar tu cuenta de Google Sheets primero.');
      return;
    }

    if (reservations.length === 0) {
      toast.error('No hay reservas registradas para sincronizar.');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStep('Conectando con Google Sheets API...');

    // Simulate progress steps
    const steps = [
      { progress: 25, step: 'Conectando con Google Sheets API...' },
      { progress: 50, step: 'Verificando columnas (A: Huésped, B: ID, C: Habitación, D: Check-In, E: Check-Out, F: Extras, G: Precio)...' },
      { progress: 80, step: `Exportando ${reservations.length} filas de reservas...` },
      { progress: 100, step: '¡Sincronización finalizada con éxito!' }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setSyncProgress(s.progress);
        setSyncStep(s.step);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setIsSyncing(false);
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-ES') + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            setLogs(prev => [
              {
                id: 'log-' + Date.now(),
                timestamp: dateStr,
                recordCount: reservations.length,
                status: 'success',
                spreadsheetId: spreadsheetId,
              },
              ...prev
            ]);
            toast.success(`Se han sincronizado ${reservations.length} reservas en la hoja de cálculo.`);
          }, 800);
        }
      }, (idx + 1) * 1000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Setup */}
        <Card className="lg:col-span-2 p-6 shadow-soft space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <FileSpreadsheet className="h-6 w-6 text-[#0F9D58]" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Configuración de Google Sheets</h3>
              <p className="text-sm text-muted-foreground">
                Configura la vinculación directa con tu hoja de cálculo corporativa.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  ID de la Hoja de Cálculo (Spreadsheet ID)
                </label>
                <Input
                  placeholder="Ej: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  disabled={isConnected || isSyncing}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nombre de la Hoja (Tab)
                </label>
                <Input
                  placeholder="Ej: Reservas"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  disabled={isConnected || isSyncing}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className={`h-3.5 w-3.5 rounded-full ${isConnected ? 'bg-[#0F9D58] animate-pulse' : 'bg-muted-foreground/30'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isConnected ? 'Conectado a Google Drive API' : 'Desconectado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? 'Cuenta: hotel-reservas@gmail.com' : 'Requiere autorización OAuth'}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isSyncing}>
                  Desconectar
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Spinner className="mr-2" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar Cuenta'
                  )}
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground max-w-[70%]">
                Las reservas se exportarán en formato tabular ordenadas por fecha de entrada. Las celdas existentes en la hoja se actualizarán o añadirán.
              </p>
              <Button
                onClick={handleSync}
                disabled={!isConnected || isSyncing || reservations.length === 0}
                className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-medium"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar Ahora
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sync Progress simulation */}
          {isSyncing && (
            <div className="bg-[#0F9D58]/5 border border-[#0F9D58]/20 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#0F9D58]">{syncStep}</span>
                <span className="font-mono font-bold text-foreground">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2 bg-[#0F9D58]/20" />
            </div>
          )}
        </Card>

        {/* Info card & Quick Links */}
        <Card className="p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Recursos de Google
            </h3>
            <p className="text-sm text-muted-foreground">
              Puedes acceder a tu hoja de cálculo directamente desde los siguientes accesos directos o consultar la documentación de la API.
            </p>
            <div className="space-y-2 pt-2">
              <a
                href="https://sheets.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded border border-border text-sm text-foreground hover:bg-secondary/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-[#0F9D58]" />
                  Abrir Google Sheets
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-blue-800 space-y-1">
                <p className="font-semibold">Estructura esperada de columnas:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-900 font-mono">
                  <li>ID Reserva</li>
                  <li>Huésped</li>
                  <li>Habitación</li>
                  <li>Check-In</li>
                  <li>Check-Out</li>
                  <li>Extras</li>
                  <li>Total</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            Última sincronización con éxito:{' '}
            <span className="font-semibold text-foreground">
              {logs[0] ? logs[0].timestamp : 'Nunca'}
            </span>
          </div>
        </Card>
      </div>

      {/* Sync Logs History */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Sincronizaciones</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Hojas de Cálculo ID</TableHead>
              <TableHead className="text-center">Registros Sincronizados</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium text-foreground">{log.timestamp}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.spreadsheetId}</TableCell>
                <TableCell className="text-center font-semibold text-foreground">{log.recordCount}</TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-emerald-100 text-emerald-800 border-none hover:bg-emerald-100 flex items-center justify-center gap-1 w-24 mx-auto animate-fade-in">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Éxito
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${log.spreadsheetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                  >
                    Ver Hoja
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
