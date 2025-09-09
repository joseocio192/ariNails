// Mock data for testing admin panel functionality
export const mockServicios = [
  {
    id: 1,
    nombre: "Manicura Clásica",
    descripcion: "Manicura básica con esmaltado",
    precio: 250.00,
    estaActivo: true
  },
  {
    id: 2,
    nombre: "Pedicura Spa",
    descripcion: "Pedicura completa con exfoliación y masaje",
    precio: 350.00,
    estaActivo: true
  },
  {
    id: 3,
    nombre: "Uñas de Gel",
    descripcion: "Aplicación de uñas de gel con diseño",
    precio: 450.00,
    estaActivo: true
  },
  {
    id: 4,
    nombre: "Manicura Francesa",
    descripcion: "Manicura con técnica francesa clásica",
    precio: 300.00,
    estaActivo: false
  }
];

export const mockEstadisticas = {
  totalCitas: 45,
  citasCanceladas: 5,
  citasCompletadas: 35,
  citasHoy: 8,
  ingresosTotales: 15750.00
};