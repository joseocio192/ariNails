-- Script para reparar usuario con rol empleado pero sin registro en tabla empleado
-- Este script crea el registro de empleado para el usuario ID 8

-- Primero verificamos que el usuario existe y tiene rol empleado
DO $$
DECLARE
    user_id INTEGER := 8;
    rol_empleado_id INTEGER;
    empleado_exists BOOLEAN;
BEGIN
    -- Obtener el ID del rol empleado
    SELECT id INTO rol_empleado_id FROM rol WHERE nombre = 'empleado';
    
    -- Verificar si ya existe un empleado para este usuario
    SELECT EXISTS(
        SELECT 1 FROM empleado WHERE "usuarioId" = user_id
    ) INTO empleado_exists;
    
    -- Si el usuario tiene rol empleado pero no tiene registro en tabla empleado
    IF empleado_exists = FALSE THEN
        -- Crear el registro de empleado
        INSERT INTO empleado (
            telefono,
            direccion,
            "usuarioId",
            "fechaCreacion",
            "estaActivo",
            "usuarioIdCreacion",
            "usuarioIdActualizacion"
        ) VALUES (
            '', -- telefono vacío por defecto
            '', -- dirección vacía por defecto
            user_id,
            NOW(),
            true,
            1, -- admin como creador
            1  -- admin como actualizador
        );
        
        RAISE NOTICE 'Registro de empleado creado para usuario ID %', user_id;
    ELSE
        RAISE NOTICE 'El usuario ID % ya tiene un registro de empleado', user_id;
    END IF;
END $$;

-- Verificar el resultado
SELECT 
    u.id as usuario_id,
    u.nombres,
    u."apellidoPaterno",
    r.nombre as rol,
    e.id as empleado_id,
    e.telefono,
    e.direccion
FROM usuario u
LEFT JOIN rol r ON u.rol_id = r.id
LEFT JOIN empleado e ON e."usuarioId" = u.id
WHERE u.id = 8;
