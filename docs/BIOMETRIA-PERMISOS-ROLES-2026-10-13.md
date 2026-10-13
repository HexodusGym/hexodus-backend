# Permisos biométricos por rol — 13 de octubre de 2026

Esta actualización incorpora a producción la migración `20261012000000_add_biometric_role_permissions` que ya existe en desarrollo. La migración modifica únicamente el JSON `roles.permisos`: no crea tablas ni columnas.

- Para claves ausentes, los administradores reciben `biometria.sincronizar` y `biometria.enrolar`.
- Los demás roles que tenían `asistencia.crear` reciben `biometria.sincronizar`.
- `biometria.enrolar` queda desactivado para los demás roles y debe concederse explícitamente en Gestión de Roles.
- Los valores biométricos personalizados que ya existan se conservan. El SQL solo completa claves ausentes, por lo que volver a ejecutarlo no reemplaza decisiones existentes.

El backend de huella/SSE ya está en producción. Una sesión de kiosco requiere `asistencia.crear` y `biometria.sincronizar`; una sesión de enrolamiento requiere `biometria.enrolar`, `biometria.sincronizar` y el permiso correspondiente de socios. Las pruebas agregadas cubren ambos casos y la revocación de permisos. `npm test` ejecuta las pruebas en secuencia para evitar interferencias entre pruebas que usan configuración compartida.

Para revisar los permisos actuales en el SQL Editor de Supabase:

```sql
SELECT rol_id, nombre, es_administrador,
       permisos -> 'biometria' AS biometria
FROM public.roles
ORDER BY nombre;
```

Agregar el archivo al repositorio no ejecuta la migración. Antes de desplegar, confirmar que los permisos esperados estén presentes en la base de destino. Si la migración se aplicó manualmente en Supabase, comprobar cómo se registró en `_prisma_migrations` antes de usar `prisma migrate deploy`.
