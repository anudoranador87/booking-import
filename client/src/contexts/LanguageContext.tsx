import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  es: {
    'app.subtitle': 'Hotel Management · Powered by AI',
    'nav.dashboard': 'Dashboard',
    'nav.parser': 'Parser Email',
    'nav.planning': 'Planning Visual',
    'nav.sheets': 'Google Sheets',
    'btn.newBooking': 'Nueva Reserva',
    'kpi.totalBookings': 'Total de Reservas',
    'kpi.totalBookingsDesc': 'Todas las estancias registradas',
    'kpi.confirmed': 'Confirmadas',
    'kpi.confirmedDesc': 'Reservas activas y pagadas',
    'kpi.pending': 'Pendientes de Pago',
    'kpi.pendingDesc': 'Requieren atención inmediata',
    'kpi.revenue': 'Ingresos Totales',
    'kpi.revenueDesc': 'Facturación acumulada',
    'chart.revenue': 'Ingresos por Habitación',
    'chart.revenueDesc': 'Desglose de facturación por unidad',
    'chart.nights': 'Noches Reservadas',
    'chart.nightsDesc': 'Ocupación por habitación',
    'list.title': 'Listado de Reservas',
    'list.desc': 'Gestiona y edita las reservas en tiempo real',
    'list.count': 'reservas',
    'modal.title': 'Crear Reserva Manual',
    'modal.desc': 'Introduce los datos del huésped para registrar la reserva directamente.',
    'toast.added': 'Reserva añadida correctamente',
    'toast.fillFields': 'Por favor, rellena todos los campos obligatorios',
    'toast.newIncoming': '¡Nueva reserva recibida de Booking.com!',
  },
  en: {
    'app.subtitle': 'Hotel Management · Powered by AI',
    'nav.dashboard': 'Dashboard',
    'nav.parser': 'Email Parser',
    'nav.planning': 'Visual Planner',
    'nav.sheets': 'Google Sheets',
    'btn.newBooking': 'New Booking',
    'kpi.totalBookings': 'Total Bookings',
    'kpi.totalBookingsDesc': 'All registered stays',
    'kpi.confirmed': 'Confirmed',
    'kpi.confirmedDesc': 'Active and paid bookings',
    'kpi.pending': 'Pending Payment',
    'kpi.pendingDesc': 'Require immediate attention',
    'kpi.revenue': 'Total Revenue',
    'kpi.revenueDesc': 'Accumulated billing',
    'chart.revenue': 'Revenue per Room',
    'chart.revenueDesc': 'Billing breakdown per unit',
    'chart.nights': 'Booked Nights',
    'chart.nightsDesc': 'Occupancy per room',
    'list.title': 'Reservations List',
    'list.desc': 'Manage and edit bookings in real time',
    'list.count': 'bookings',
    'modal.title': 'Create Manual Booking',
    'modal.desc': 'Enter guest details to register the booking directly.',
    'toast.added': 'Booking added successfully',
    'toast.fillFields': 'Please fill all required fields',
    'toast.newIncoming': 'New booking received from Booking.com!',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('app-language');
    return (savedLang as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
