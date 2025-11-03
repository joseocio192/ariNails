'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ACCENT_SOLID } from '../../theme/colors';
import { CalendarEvent, Cita } from '../../../core/domain/types/citas';
import '../../../app/calendar.css';

// Configurar localizador de fechas en español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales,
});

// Componente personalizado para mostrar el contador de citas
const CustomDateCellWrapper: React.FC<{
  children: React.ReactNode;
  value: Date;
  range?: Date[];
}> = ({ children, value }) => {
  return (
    <div className="rbc-day-bg">
      {children}
    </div>
  );
};

// Componente personalizado para el contenido del mes
const CustomMonthEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  return null; // No mostramos el evento individual
};

interface CalendarComponentProps {
  events: CalendarEvent[];
  view: View;
  date: Date;
  selectedDate?: Date;
  onNavigate: (date: Date) => void;
  onView: (view: View) => void;
  onSelectSlot: ({ start }: { start: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({
  events,
  view,
  date,
  selectedDate,
  onNavigate,
  onView,
  onSelectSlot,
  onSelectEvent,
}) => {
  // Función para resaltar el día seleccionado
  const dayPropGetter = (date: Date) => {
    if (selectedDate) {
      const isSameDay = 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      if (isSameDay) {
        return {
          style: {
            backgroundColor: 'rgba(125, 150, 116, 0.15)',
            border: '2px solid ' + ACCENT_SOLID,
            borderRadius: '50%',
          }
        };
      }
    }
    return {};
  };

  // Contar citas por día
  const getEventCountForDate = (targetDate: Date) => {
    return events.filter(event => 
      isSameDay(event.start, targetDate)
    ).length;
  };

  // Componente personalizado para mostrar solo el número del día con el contador
  const CustomDateHeader: React.FC<{ date: Date; label: string }> = ({ date, label }) => {
    const count = getEventCountForDate(date);
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '4px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
        {count > 0 && (
          <Chip
            label={`${count} cita${count !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              height: '16px',
              fontSize: '9px',
              backgroundColor: ACCENT_SOLID,
              color: 'white',
              marginTop: '2px',
              '& .MuiChip-label': {
                padding: '0 4px'
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Box sx={{ height: 350 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={onNavigate}
          view="month"
          views={['month']}
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          selectable
          culture="es"
          toolbar={true}
          dayPropGetter={dayPropGetter}
          components={{
            month: {
              dateHeader: CustomDateHeader,
              event: CustomMonthEvent,
            }
          }}
          messages={{
            next: "›",
            previous: "‹",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay citas en este rango.",
            showMore: (total) => `+${total}`
          }}
          style={{ 
            height: '100%',
            fontSize: '12px'
          }}
          dayLayoutAlgorithm="no-overlap"
          eventPropGetter={(event) => {
            const cita = event.resource as Cita;
            let backgroundColor: string = '#7d9674';
            
            // Primero verificar si está cancelada
            if (cita.cancelada) {
              backgroundColor = '#ef4444'; // Rojo para canceladas
            } else if (cita.estado === 'completada') {
              backgroundColor = '#22c55e'; // Verde para completadas
            } else if (cita.estado === 'confirmada') {
              backgroundColor = '#3b82f6'; // Azul para confirmadas
            }

            return {
              style: {
                backgroundColor,
                borderRadius: '2px',
                opacity: 0.8,
                color: 'white',
                border: 'none',
                fontSize: '10px',
                padding: '1px 3px'
              }
            };
          }}
          formats={{
            dayFormat: 'd',
            monthHeaderFormat: 'MMMM yyyy'
          }}
        />
      </Box>
    </>
  );
};