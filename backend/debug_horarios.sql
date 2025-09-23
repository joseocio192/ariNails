SELECT 
    h.id, 
    h.desde, 
    h.hasta, 
    h."empleadoId", 
    u.nombres 
FROM horario h 
JOIN empleado e ON h."empleadoId" = e.id 
JOIN usuario u ON e."usuarioId" = u.id 
WHERE DATE(h.desde) = '2025-09-08' 
ORDER BY u.nombres, h.desde;
