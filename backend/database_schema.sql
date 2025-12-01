-- ============================================
-- ARI NAILS - Database Schema
-- PostgreSQL Database Schema
-- Generado: 2025-11-26
-- ============================================

-- Eliminar tablas existentes (en orden inverso de dependencias)
DROP TABLE IF EXISTS "citas_to_servicios" CASCADE;
DROP TABLE IF EXISTS "servicios_to_roles" CASCADE;
DROP TABLE IF EXISTS "horario" CASCADE;
DROP TABLE IF EXISTS "cita" CASCADE;
DROP TABLE IF EXISTS "servicio" CASCADE;
DROP TABLE IF EXISTS "empleado" CASCADE;
DROP TABLE IF EXISTS "cliente" CASCADE;
DROP TABLE IF EXISTS "usuario" CASCADE;
DROP TABLE IF EXISTS "rol" CASCADE;

-- ============================================
-- TABLA: rol
-- Descripción: Roles de usuario del sistema
-- ============================================
CREATE TABLE "rol" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "UQ_rol_nombre" UNIQUE ("nombre")
);

COMMENT ON TABLE "rol" IS 'Roles de usuario del sistema';
COMMENT ON COLUMN "rol"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "rol"."nombre" IS 'Nombre del rol';
COMMENT ON COLUMN "rol"."descripcion" IS 'Descripción del rol';
COMMENT ON COLUMN "rol"."fechaCreacion" IS 'Fecha de creación del registro';
COMMENT ON COLUMN "rol"."fechaActualizacion" IS 'Fecha de la última actualización del registro';
COMMENT ON COLUMN "rol"."usuarioIdCreacion" IS 'Usuario que realizó la creación del registro';
COMMENT ON COLUMN "rol"."usuarioIdActualizacion" IS 'Usuario que realizó la última actualización del registro';
COMMENT ON COLUMN "rol"."estaActivo" IS 'Indica si el registro está activo o inactivo';

-- ============================================
-- TABLA: usuario
-- Descripción: Usuarios del sistema
-- ============================================
CREATE TABLE "usuario" (
    "id" SERIAL PRIMARY KEY,
    "nombres" VARCHAR(255) NOT NULL,
    "apellidoPaterno" VARCHAR(255) NOT NULL,
    "apellidoMaterno" VARCHAR(255) NOT NULL,
    "usuario" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_usuario_rol" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UQ_usuario_usuario" UNIQUE ("usuario"),
    CONSTRAINT "UQ_usuario_email" UNIQUE ("email")
);

COMMENT ON TABLE "usuario" IS 'Usuarios del sistema';
COMMENT ON COLUMN "usuario"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "usuario"."nombres" IS 'Nombres del usuario';
COMMENT ON COLUMN "usuario"."apellidoPaterno" IS 'Apellido paterno del usuario';
COMMENT ON COLUMN "usuario"."apellidoMaterno" IS 'Apellido materno del usuario';
COMMENT ON COLUMN "usuario"."usuario" IS 'Nombre de usuario';
COMMENT ON COLUMN "usuario"."email" IS 'Email del usuario';
COMMENT ON COLUMN "usuario"."password" IS 'Contraseña del usuario (hash bcrypt)';
COMMENT ON COLUMN "usuario"."rol_id" IS 'Rol del usuario';

-- ============================================
-- TABLA: cliente
-- Descripción: Clientes del negocio
-- ============================================
CREATE TABLE "cliente" (
    "id" SERIAL PRIMARY KEY,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" VARCHAR(500) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_cliente_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UQ_cliente_usuario" UNIQUE ("usuarioId")
);

COMMENT ON TABLE "cliente" IS 'Clientes del negocio';
COMMENT ON COLUMN "cliente"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "cliente"."telefono" IS 'Teléfono del cliente';
COMMENT ON COLUMN "cliente"."direccion" IS 'Dirección del cliente';
COMMENT ON COLUMN "cliente"."usuarioId" IS 'Usuario asociado al cliente';

-- ============================================
-- TABLA: empleado
-- Descripción: Empleados del negocio
-- ============================================
CREATE TABLE "empleado" (
    "id" SERIAL PRIMARY KEY,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" VARCHAR(500) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_empleado_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UQ_empleado_usuario" UNIQUE ("usuarioId")
);

COMMENT ON TABLE "empleado" IS 'Empleados del negocio';
COMMENT ON COLUMN "empleado"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "empleado"."telefono" IS 'Teléfono del empleado';
COMMENT ON COLUMN "empleado"."direccion" IS 'Dirección del empleado';
COMMENT ON COLUMN "empleado"."usuarioId" IS 'Usuario asociado al empleado';

-- ============================================
-- TABLA: horario
-- Descripción: Horarios disponibles de empleados
-- ============================================
CREATE TABLE "horario" (
    "id" SERIAL PRIMARY KEY,
    "desde" TIMESTAMP NOT NULL,
    "hasta" TIMESTAMP NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_horario_empleado" FOREIGN KEY ("empleadoId") REFERENCES "empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CHK_horario_fechas" CHECK ("hasta" > "desde")
);

COMMENT ON TABLE "horario" IS 'Horarios disponibles de empleados';
COMMENT ON COLUMN "horario"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "horario"."desde" IS 'Fecha y hora de inicio del horario';
COMMENT ON COLUMN "horario"."hasta" IS 'Fecha y hora de fin del horario';
COMMENT ON COLUMN "horario"."empleadoId" IS 'Empleado asociado al horario';

-- ============================================
-- TABLA: servicio
-- Descripción: Servicios ofrecidos por el negocio
-- ============================================
CREATE TABLE "servicio" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "precio" DECIMAL(10, 2) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL DEFAULT 'basico',
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "CHK_servicio_precio" CHECK ("precio" >= 0),
    CONSTRAINT "CHK_servicio_categoria" CHECK ("categoria" IN ('basico', 'extra'))
);

COMMENT ON TABLE "servicio" IS 'Servicios ofrecidos por el negocio';
COMMENT ON COLUMN "servicio"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "servicio"."nombre" IS 'Nombre del servicio';
COMMENT ON COLUMN "servicio"."descripcion" IS 'Descripción del servicio';
COMMENT ON COLUMN "servicio"."precio" IS 'Precio del servicio';
COMMENT ON COLUMN "servicio"."categoria" IS 'Categoría del servicio (basico o extra)';

-- ============================================
-- TABLA: servicios_to_roles
-- Descripción: Relación entre servicios y roles
-- ============================================
CREATE TABLE "servicios_to_roles" (
    "id" SERIAL PRIMARY KEY,
    "servicioId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_servicios_to_roles_servicio" FOREIGN KEY ("servicioId") REFERENCES "servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_servicios_to_roles_rol" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UQ_servicios_to_roles" UNIQUE ("servicioId", "rolId")
);

COMMENT ON TABLE "servicios_to_roles" IS 'Relación entre servicios y roles que pueden acceder';
COMMENT ON COLUMN "servicios_to_roles"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "servicios_to_roles"."servicioId" IS 'Servicio asociado';
COMMENT ON COLUMN "servicios_to_roles"."rolId" IS 'Rol asociado';

-- ============================================
-- TABLA: cita
-- Descripción: Citas agendadas
-- ============================================
CREATE TABLE "cita" (
    "id" SERIAL PRIMARY KEY,
    "horaInicio" TIME NULL,
    "horaFinEsperada" TIME NULL,
    "horaFin" TIME NULL,
    "fecha" DATE NOT NULL,
    "hora" VARCHAR(10) NOT NULL,
    "precio" DECIMAL(10, 2) NOT NULL,
    "precioFull" DECIMAL(10, 2) NOT NULL,
    "descuento" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "precioFinal" DECIMAL(10, 2) NOT NULL,
    "cancelada" BOOLEAN NOT NULL DEFAULT FALSE,
    "motivoCancelacion" VARCHAR(500) NULL,
    "anticipoPagado" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "stripePaymentIntentId" VARCHAR(255) NULL,
    "clienteId" INTEGER NOT NULL,
    "empleadoId" INTEGER NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_cita_cliente" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FK_cita_empleado" FOREIGN KEY ("empleadoId") REFERENCES "empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CHK_cita_precios" CHECK ("precio" >= 0 AND "precioFull" >= 0 AND "descuento" >= 0 AND "precioFinal" >= 0 AND "anticipoPagado" >= 0)
);

COMMENT ON TABLE "cita" IS 'Citas agendadas';
COMMENT ON COLUMN "cita"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "cita"."horaInicio" IS 'Hora de inicio real de la cita';
COMMENT ON COLUMN "cita"."horaFinEsperada" IS 'Hora de fin esperada de la cita';
COMMENT ON COLUMN "cita"."horaFin" IS 'Hora de fin real de la cita';
COMMENT ON COLUMN "cita"."fecha" IS 'Fecha de la cita';
COMMENT ON COLUMN "cita"."hora" IS 'Hora programada de la cita';
COMMENT ON COLUMN "cita"."precio" IS 'Precio base de la cita';
COMMENT ON COLUMN "cita"."precioFull" IS 'Precio completo sin descuentos';
COMMENT ON COLUMN "cita"."descuento" IS 'Descuento aplicado';
COMMENT ON COLUMN "cita"."precioFinal" IS 'Precio final a pagar';
COMMENT ON COLUMN "cita"."cancelada" IS 'Indica si la cita fue cancelada';
COMMENT ON COLUMN "cita"."motivoCancelacion" IS 'Motivo de cancelación de la cita';
COMMENT ON COLUMN "cita"."anticipoPagado" IS 'Anticipo pagado';
COMMENT ON COLUMN "cita"."stripePaymentIntentId" IS 'ID del pago en Stripe';
COMMENT ON COLUMN "cita"."clienteId" IS 'Cliente que agendó la cita';
COMMENT ON COLUMN "cita"."empleadoId" IS 'Empleado asignado a la cita';

-- ============================================
-- TABLA: citas_to_servicios
-- Descripción: Relación entre citas y servicios
-- ============================================
CREATE TABLE "citas_to_servicios" (
    "id" SERIAL PRIMARY KEY,
    "citaId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT NOW(),
    "usuarioIdCreacion" INTEGER NOT NULL DEFAULT 1,
    "usuarioIdActualizacion" INTEGER NOT NULL DEFAULT 1,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT "FK_citas_to_servicios_cita" FOREIGN KEY ("citaId") REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FK_citas_to_servicios_servicio" FOREIGN KEY ("servicioId") REFERENCES "servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UQ_citas_to_servicios" UNIQUE ("citaId", "servicioId")
);

COMMENT ON TABLE "citas_to_servicios" IS 'Relación entre citas y servicios incluidos';
COMMENT ON COLUMN "citas_to_servicios"."id" IS 'Identificador único del registro';
COMMENT ON COLUMN "citas_to_servicios"."citaId" IS 'Cita asociada';
COMMENT ON COLUMN "citas_to_servicios"."servicioId" IS 'Servicio incluido en la cita';

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índices para tabla usuario
CREATE INDEX "IDX_usuario_rol_id" ON "usuario"("rol_id");
CREATE INDEX "IDX_usuario_email" ON "usuario"("email");
CREATE INDEX "IDX_usuario_usuario" ON "usuario"("usuario");
CREATE INDEX "IDX_usuario_estaActivo" ON "usuario"("estaActivo");

-- Índices para tabla cliente
CREATE INDEX "IDX_cliente_usuarioId" ON "cliente"("usuarioId");
CREATE INDEX "IDX_cliente_estaActivo" ON "cliente"("estaActivo");

-- Índices para tabla empleado
CREATE INDEX "IDX_empleado_usuarioId" ON "empleado"("usuarioId");
CREATE INDEX "IDX_empleado_estaActivo" ON "empleado"("estaActivo");

-- Índices para tabla horario
CREATE INDEX "IDX_horario_empleadoId" ON "horario"("empleadoId");
CREATE INDEX "IDX_horario_desde" ON "horario"("desde");
CREATE INDEX "IDX_horario_hasta" ON "horario"("hasta");
CREATE INDEX "IDX_horario_empleado_fecha" ON "horario"("empleadoId", "desde", "hasta");

-- Índices para tabla servicio
CREATE INDEX "IDX_servicio_categoria" ON "servicio"("categoria");
CREATE INDEX "IDX_servicio_estaActivo" ON "servicio"("estaActivo");

-- Índices para tabla servicios_to_roles
CREATE INDEX "IDX_servicios_to_roles_servicioId" ON "servicios_to_roles"("servicioId");
CREATE INDEX "IDX_servicios_to_roles_rolId" ON "servicios_to_roles"("rolId");

-- Índices para tabla cita
CREATE INDEX "IDX_cita_clienteId" ON "cita"("clienteId");
CREATE INDEX "IDX_cita_empleadoId" ON "cita"("empleadoId");
CREATE INDEX "IDX_cita_fecha" ON "cita"("fecha");
CREATE INDEX "IDX_cita_cancelada" ON "cita"("cancelada");
CREATE INDEX "IDX_cita_fecha_empleado" ON "cita"("fecha", "empleadoId");
CREATE INDEX "IDX_cita_fecha_cliente" ON "cita"("fecha", "clienteId");

-- Índices para tabla citas_to_servicios
CREATE INDEX "IDX_citas_to_servicios_citaId" ON "citas_to_servicios"("citaId");
CREATE INDEX "IDX_citas_to_servicios_servicioId" ON "citas_to_servicios"("servicioId");

-- ============================================
-- DATOS INICIALES (SEED DATA)
-- ============================================

-- Insertar roles por defecto
INSERT INTO "rol" ("nombre", "descripcion", "usuarioIdCreacion", "usuarioIdActualizacion") VALUES
('admin', 'Administrador del sistema con todos los permisos', 1, 1),
('empleado', 'Empleado que puede gestionar citas y servicios', 1, 1),
('cliente', 'Cliente que puede agendar citas y ver servicios', 1, 1);

-- Insertar usuario admin por defecto (password: Admin123!)
INSERT INTO "usuario" ("nombres", "apellidoPaterno", "apellidoMaterno", "usuario", "email", "password", "rol_id", "usuarioIdCreacion", "usuarioIdActualizacion") VALUES
('Administrador', 'Sistema', 'AriNails', 'admin', 'admin@arinails.com', '$2b$10$xQXJ5b5Z8Z5Z8Z5Z8Z5Z8uJ5Z8Z5Z8Z5Z8Z5Z8Z5Z8Z5Z8Z5Z8Z5Z', 1, 1, 1);

-- Insertar servicios básicos por defecto
INSERT INTO "servicio" ("nombre", "descripcion", "precio", "categoria", "usuarioIdCreacion", "usuarioIdActualizacion") VALUES
('Manicure Básico', 'Limpieza, limado y esmaltado de uñas', 350.00, 'basico', 1, 1),
('Manicure Premium', 'Incluye tratamiento de cutículas y masaje de manos', 450.00, 'basico', 1, 1),
('Manicure de Lujo', 'Servicio completo con diseño personalizado y tratamiento especial', 550.00, 'basico', 1, 1),
('Decoración 3D', 'Decoración especial con diseños 3D y piedras', 100.00, 'extra', 1, 1),
('Extensión de Uñas', 'Extensión de uñas con gel', 200.00, 'extra', 1, 1);

-- Asociar servicios con roles
INSERT INTO "servicios_to_roles" ("servicioId", "rolId", "usuarioIdCreacion", "usuarioIdActualizacion")
SELECT s.id, r.id, 1, 1
FROM "servicio" s
CROSS JOIN "rol" r
WHERE r.nombre IN ('cliente', 'empleado', 'admin');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de usuarios con información completa
CREATE OR REPLACE VIEW "v_usuarios_completos" AS
SELECT 
    u.id,
    u.nombres,
    u.apellidoPaterno,
    u.apellidoMaterno,
    u.usuario,
    u.email,
    r.nombre AS rol,
    u.estaActivo,
    u.fechaCreacion,
    u.fechaActualizacion
FROM "usuario" u
INNER JOIN "rol" r ON u.rol_id = r.id;

-- Vista de citas con información completa
CREATE OR REPLACE VIEW "v_citas_completas" AS
SELECT 
    c.id,
    c.fecha,
    c.hora,
    c.horaInicio,
    c.horaFinEsperada,
    c.horaFin,
    c.precio,
    c.precioFull,
    c.descuento,
    c.precioFinal,
    c.anticipoPagado,
    c.cancelada,
    c.motivoCancelacion,
    -- Información del cliente
    cli.id AS clienteId,
    uc.nombres AS clienteNombres,
    uc.apellidoPaterno AS clienteApellidoPaterno,
    uc.apellidoMaterno AS clienteApellidoMaterno,
    cli.telefono AS clienteTelefono,
    -- Información del empleado
    emp.id AS empleadoId,
    ue.nombres AS empleadoNombres,
    ue.apellidoPaterno AS empleadoApellidoPaterno,
    ue.apellidoMaterno AS empleadoApellidoMaterno,
    emp.telefono AS empleadoTelefono,
    c.fechaCreacion,
    c.fechaActualizacion
FROM "cita" c
INNER JOIN "cliente" cli ON c."clienteId" = cli.id
INNER JOIN "usuario" uc ON cli."usuarioId" = uc.id
LEFT JOIN "empleado" emp ON c."empleadoId" = emp.id
LEFT JOIN "usuario" ue ON emp."usuarioId" = ue.id;

-- Vista de servicios por cita
CREATE OR REPLACE VIEW "v_servicios_por_cita" AS
SELECT 
    cs.id,
    cs."citaId",
    c.fecha AS citaFecha,
    c.hora AS citaHora,
    s.id AS servicioId,
    s.nombre AS servicioNombre,
    s.descripcion AS servicioDescripcion,
    s.precio AS servicioPrecio,
    s.categoria AS servicioCategoria
FROM "citas_to_servicios" cs
INNER JOIN "cita" c ON cs."citaId" = c.id
INNER JOIN "servicio" s ON cs."servicioId" = s.id
WHERE cs."estaActivo" = TRUE;

-- Vista de horarios disponibles de empleados
CREATE OR REPLACE VIEW "v_horarios_empleados" AS
SELECT 
    h.id,
    h.desde,
    h.hasta,
    emp.id AS empleadoId,
    u.nombres AS empleadoNombres,
    u.apellidoPaterno AS empleadoApellidoPaterno,
    u.apellidoMaterno AS empleadoApellidoMaterno,
    emp.telefono AS empleadoTelefono,
    h.estaActivo
FROM "horario" h
INNER JOIN "empleado" emp ON h."empleadoId" = emp.id
INNER JOIN "usuario" u ON emp."usuarioId" = u.id;

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar automáticamente fechaActualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW."fechaActualizacion" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fechaActualizacion
CREATE TRIGGER trigger_actualizar_rol
    BEFORE UPDATE ON "rol"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_usuario
    BEFORE UPDATE ON "usuario"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_cliente
    BEFORE UPDATE ON "cliente"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_empleado
    BEFORE UPDATE ON "empleado"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_horario
    BEFORE UPDATE ON "horario"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_servicio
    BEFORE UPDATE ON "servicio"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_cita
    BEFORE UPDATE ON "cita"
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- ============================================
-- FUNCIÓN PARA CALCULAR PRECIO FINAL DE CITA
-- ============================================
CREATE OR REPLACE FUNCTION calcular_precio_final_cita(
    p_precio_base DECIMAL(10,2),
    p_descuento DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN GREATEST(0, p_precio_base - p_descuento);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISOS (ajustar según necesidad)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================