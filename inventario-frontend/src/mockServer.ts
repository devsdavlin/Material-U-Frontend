import { setupWorker, rest } from 'msw';

// Mock data similar to fallback used in UI components
const mockMaterials = [
  { id_material: 1, internal_code: 'MIG 001', material_name: 'PARRILLA ASADOR A GAS PLUS + BANDEJA LATERAL', unit: 'UN', category: 'Equipos', min_stock: 5 },
  { id_material: 2, internal_code: 'MIG 002', material_name: 'LAVARROPAS ECO 48X60 CM FIRPLAK', unit: 'UN', category: 'Grifería', min_stock: 2 },
  { id_material: 3, internal_code: 'MIG 003', material_name: 'CATALIZADOR EPOXICO X 1/4 TITO PABON', unit: 'GL', category: 'Pinturas', min_stock: 10 },
];

const mockInventory = [
  { id_material: 1, internal_code: 'MIG 001', material_name: 'PARRILLA ASADOR A GAS PLUS + BANDEJA LATERAL', unit: 'UN', category: 'Equipos', stock: 20, min_stock: 5 },
  { id_material: 2, internal_code: 'MIG 002', material_name: 'LAVARROPAS ECO 48X60 CM FIRPLAK', unit: 'UN', category: 'Grifería', stock: 8, min_stock: 2 },
  { id_material: 3, internal_code: 'MIG 003', material_name: 'CATALIZADOR EPOXICO X 1/4 TITO PABON', unit: 'GL', category: 'Pinturas', stock: 15, min_stock: 10 },
];

const mockEntries = [
  { id: 1, materialId: 1, codigoMig: 'MIG 001', proveedor: 'Proveedor A', cantidad: 5 },
];

const mockExits = [
  { id: 1, materialId: 2, codigoVale: 'VAL 001', centroCosto: 'CC001', cantidad: 2 },
];

const handlers = [
  // Login endpoint – return a dummy token and normalized user
  rest.post('/api/users/login', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ token: 'offline-token', user: { id_user: '1', nombre: 'Admin', email: 'admin@inventario.com', rol: 'Administrador', sedeId: '1' } })
    );
  }),

  // Materials list
  rest.get('/api/materials/buscar', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockMaterials));
  }),

  // Inventory list
  rest.get('/api/inventory', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ok: true, items: mockInventory, resumen: { total: mockInventory.length, con_stock: 2, agotados: 0, bajo_minimo: 1 } }));
  }),

  // Entries list
  rest.get('/api/entries', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockEntries));
  }),

  // Exits list
  rest.get('/api/exits', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockExits));
  }),

  // Warehouses list
  rest.get('/api/warehouses', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ id: '1', nombre: 'Sede principal' }]));
  }),
];

export const startMockServer = () => {
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return;
  }

  const worker = setupWorker(...handlers);
  worker.start({ onUnhandledRequest: 'bypass' });
  console.log('🔸 Mock Service Worker (browser) started');
};

