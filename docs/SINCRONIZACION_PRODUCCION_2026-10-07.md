# Cambios locales para producción — 7 de octubre de 2026

## Alcance

Se compararon los 106 archivos de la copia local con
`HexodusGym/hexodus-backend:main`, commit
`470ea79db8b3d464cf949dfd21b02b7df0e8a147`, normalizando únicamente CRLF/LF.
105 archivos ya coinciden y el único cambio funcional está en
`src/controller/usuarioController.js`. La copia recibida no contiene `.git`;
la rama se creó sobre el historial actual del repositorio de producción.

Se conserva `docs/SINCRONIZACION_PRODUCCION_2026-09-29.md`, presente solo en
el remoto, como registro histórico de la entrega anterior. No hay cambios
en dependencias, archivos de bloqueo, configuración, esquema Prisma ni
migraciones SQL.

## Actualización de contraseñas de usuarios

La ruta existente `PATCH /api/usuarios/:id` conserva la autenticación y el
permiso `usuarios.editar` definidos en el router.

- Cuando se envía `password`, debe ser una cadena de entre 6 y 72 unidades
  de longitud de JavaScript (`String.length`). Un tipo inválido, `null`, una
  cadena vacía o una longitud fuera del intervalo devuelve HTTP 400 antes
  de consultar la base de datos.
- Una contraseña válida se cifra mediante el flujo bcrypt existente y se
  guardan `passwordResetToken: null` y `passwordResetExpires: null` en la
  misma actualización para invalidar recuperaciones pendientes.
- La auditoría agrega la indicación de que la contraseña se restableció
  desde Gestión de Usuarios, sin incluir la contraseña.
- Al omitir `password`, la edición de los demás datos conserva el
  comportamiento anterior y no modifica los campos de recuperación.

Ejemplo: enviar `password: ""` antes omitía el cambio de contraseña; ahora
responde 400. El frontend debe omitir el campo cuando solo edite otros datos.
El límite implementado usa `String.length`, no bytes UTF-8; esta entrega
reproduce exactamente el código local y no añade validaciones de bytes.

## Verificación ejecutada

- `npm ci --no-audit --no-fund`: instalación completada y cliente Prisma
  5.22.0 generado. No se ejecutó una auditoría de dependencias.
- `npm test`: 16 pruebas aprobadas, sin fallos.
- `node --check`: 74 archivos JavaScript de `src` y `tests` sin errores.
- Verificación temporal del controlador real con Prisma simulado y bcrypt
  real: 11 escenarios aprobados. Incluyen ocho entradas inválidas sin
  acceso a datos, los límites de 6 y 72 caracteres y una edición sin
  contraseña. Se comprobó el hash, la invalidación de tokens, la anotación
  de auditoría, la ausencia del hash en la respuesta y de la contraseña
  en la auditoría. Esta verificación no agrega archivos de pruebas al PR.
- Comparación final: los 106 archivos originales coinciden con el contenido
  local al normalizar CRLF/LF.
- `git -c core.whitespace=cr-at-eol diff --check`: sin errores.

No se probaron solicitudes HTTP con sesiones reales ni se conectó a una
base de datos real. No se ejecutaron migraciones ni despliegues.

## Publicación y revisión

Rama: `codex/usuarios-password-produccion-2026-10-07`, publicada en
`Roberstxx/hexodus-backend`, donde la cuenta conectada tiene escritura.
El PR se dirige a `HexodusGym/hexodus-backend:main`.

El merge queda a cargo del propietario. El cambio no requiere migraciones
nuevas ni variables de entorno adicionales. Tras desplegar, verificar una
edición sin contraseña y un restablecimiento desde Gestión de Usuarios,
incluido el rechazo de un enlace de recuperación anterior.
