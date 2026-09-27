# Contrato de API del frontend

## Base URL
- Desarrollo: /api cuando se usa MSW o un proxy local.
- Producción: `VITE_API_URL` desde el entorno.
- Actualmente el proyecto se configura con:
  `VITE_API_URL=https://material-u-backend.onrender.com/api`

## Auth
### Login
- Endpoint exacto del backend: `POST /api/users/login`
- Body:
  ```json
  {
    "email": "admin@empresa.com",
    "password": "secret"
  }
  ```
- Respuesta esperada:
  ```json
  {
    "token": "jwt_o_token",
    "user": {
      "id_user": 1,
      "name": "Ana",
      "nombre": "Ana",
      "email": "admin@empresa.com",
      "rol": "Administrador",
      "warehouse_id": 1,
      "sedeId": "1"
    }
  }
  ```
- Si el backend devuelve `role` o `roles` en lugar de `rol`, el frontend ya normaliza varios formatos.

## Recursos principales
- Materiales: `GET /api/materials/buscar` y CRUD bajo `/api/materials`
- Inventario: `GET /api/inventory`
- Entradas: `GET /api/entries`
- Salidas: `GET /api/exits`
- Sedes: `GET /api/warehouses`
- Dashboard de sede: `GET /api/dashboard/mi-sede`
- Dinero de sede: `GET /api/money/mi-sede`

## Autorización
- El token se envía en el header:
  `Authorization: Bearer <token>`
- Si no se envía token o es inválido, el backend responde 401, que es el comportamiento esperado.
- Se mantiene compatibilidad para `token` e `inventario_token` en localStorage.

## Observaciones de integración
- El contrato real ya quedó alineado a la API desplegada en Render.
- El frontend usa un punto único de origen (`API_BASE_URL`) y una capa centralizada de rutas para evitar errores de endpoint.
