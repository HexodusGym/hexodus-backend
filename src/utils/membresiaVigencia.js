import {
  fechaStrAInicio,
  fechaUTCADiaStr,
  localAUTC,
} from "./timezone.js";

export const inicioDiaMembresia = (fecha = new Date()) =>
  fechaStrAInicio(fechaUTCADiaStr(fecha));

export const finDiaMembresia = (fechaFin) => {
  const [year, month, day] = fechaUTCADiaStr(fechaFin).split("-").map(Number);
  return new Date(localAUTC(year, month, day + 1, 0, 0, 0, 0).getTime() - 1);
};

export const membresiaVigente = (membresia, fecha = new Date()) => {
  if (!membresia?.fechaFin) return false;
  return fechaUTCADiaStr(fecha) <= fechaUTCADiaStr(membresia.fechaFin);
};

export const esUltimoDiaMembresia = (membresia, fecha = new Date()) => {
  if (!membresia?.fechaFin) return false;
  return fechaUTCADiaStr(membresia.fechaFin) === fechaUTCADiaStr(fecha);
};

export const evaluarAccesoMembresia = (membresia, fecha = new Date(), diasAviso = 0) => {
  if (!membresia) {
    return {
      permitido: false,
      estado: "sin_membresia",
      motivoCodigo: "sin_membresia",
      motivoTexto: "Socio sin membresÃ­a asignada",
    };
  }

  if (!membresiaVigente(membresia, fecha)) {
    return {
      permitido: false,
      estado: "vencida",
      motivoCodigo: "membresia_vencida",
      motivoTexto: "MembresÃ­a vencida",
    };
  }

  if (
    membresia.estadoPago === "sin_pagar" ||
    membresia.estadoPago === "pendiente"
  ) {
    return {
      permitido: false,
      estado: "sin_pago",
      motivoCodigo: "sin_pago",
      motivoTexto: "MembresÃ­a sin pagar",
    };
  }

  // Comparar dÃ­as calendario en la zona del gimnasio, no periodos de 24 horas.
  const diasRestantes = Math.round((Date.parse(fechaUTCADiaStr(membresia.fechaFin)) - Date.parse(fechaUTCADiaStr(fecha))) / 86400000);
  const ultimoDia = diasRestantes === 0;
  const proximoVencer = diasRestantes >= 0 && diasRestantes <= diasAviso;

  return {
    permitido: true,
    estado: proximoVencer ? "proximo_vencer" : "vigente",
    motivoCodigo: proximoVencer ? "proximo_vencer" : "ok",
    motivoTexto: ultimoDia
      ? "MembresÃ­a vigente en su Ãºltimo dÃ­a"
      : proximoVencer
      ? `Tu membresÃ­a vence en ${diasRestantes} ${diasRestantes === 1 ? "dÃ­a" : "dÃ­as"}`
      : "MembresÃ­a vigente",
  };
};

export const evaluarAccesoSocio = (
  socio,
  membresia,
  fecha = new Date(),
  diasAviso = 0,
) => {
  if (!socio || socio.isDeleted) {
    return {
      permitido: false,
      estado: "socio_no_disponible",
      motivoCodigo: "socio_no_disponible",
      motivoTexto: "Socio no encontrado o eliminado",
    };
  }

  if (socio.status === "bloqueado") {
    return {
      permitido: false,
      estado: "socio_bloqueado",
      motivoCodigo: "socio_bloqueado",
      motivoTexto: "Socio bloqueado administrativamente",
    };
  }

  return evaluarAccesoMembresia(membresia, fecha, diasAviso);
};

