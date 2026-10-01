// Ayudas para registrar varios materiales de una sola vez (entradas / salidas).
// El backend guarda UN material por registro y exige que el número de documento
// sea único por sede, así que cada línea se envía como su propio registro con el
// número base + un sufijo: FAC-001 -> FAC-001-1, FAC-001-2, ...

// Largo máximo del número de documento en la base de datos (VarChar(50)).
export const MAX_NUMERO_DOCUMENTO = 50;

let contadorLineas = 0;
export const siguienteIdLinea = (): number => ++contadorLineas;

// Con una sola línea se respeta el número tal cual lo escribió la persona.
export const numeroDeLinea = (base: string, indice: number, total: number): string =>
  total > 1 ? `${base}-${indice + 1}` : base;