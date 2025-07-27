import React, { useEffect, useRef } from "react";

const formatMoney = (value, currency = "₡") =>
  value != null ? `${currency}${parseFloat(value).toLocaleString("es-CR", { minimumFractionDigits: 2 })}` : "N/A";

const ModalDetalleEmpleado = ({
  show,
  onClose,
  empleado,
  calculos,
  aumentos,
  horasExtras,
  metricas,
  rebajos,
  tipoPlanillaLabel,
  periodoLabel,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (show) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [show]);

  if (!empleado) return null;

  // Puedes ajustar estos datos según tu estructura real
  const empresa = empleado.nombre_comercial_empresa || "NOMBRE DE LA EMPRESA";
  const puesto = empleado.tipo_contrato_empleado_gestor || "Puesto";
  const tipoSalario = empleado.tipo_planilla_empleado_gestor || "Compensación a ₡450 000,00 por unidad";
  const periodo = empleado.periodo_pago || "Periodo de pago";
  const salarioNormal = empleado.salario_base_empleado_gestor || 0;

  return (
    <dialog ref={dialogRef} className="modal-dialog-custom" onClose={onClose}>
      <form method="dialog" style={{ width: "100%" }}>
        <div className="p-4">
          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700 }}>{empresa}</h4>
              <div style={{ fontSize: 13, color: "#444" }}>
                <b>Código:</b> {empleado.codigo || empleado.numero_socio_empleado_gestor}<br />
                <b>Cédula:</b> {empleado.cedula_empleado_gestor}<br />
                <b>Compensación Normal:</b> {formatMoney(salarioNormal)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                Previsualización de Pago de Compensación
              </div>
              <div style={{ fontSize: 13 }}>{periodoLabel}</div>
              <div style={{ marginTop: 10 }}>
                <b>Nombre:</b> {empleado.nombre_completo_empleado_gestor}<br />
                <b>Puesto:</b> {puesto}<br />
                <b>Tipo de Compensación:</b> {tipoSalario}
              </div>
            </div>
          </div>
          <hr />

          {/* Tabla de resumen tipo colilla */}
          <table className="table table-bordered table-sm mb-4">
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th>Compensación Base</th>
                <th>Devengado</th>
                <th>Cargas Sociales</th>
                <th>Monto de RTN Neto</th>
                <th>Monto Neto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{calculos?.compensacion_base || "N/A"}</td>
                <td>{calculos?.devengado || "N/A"}</td>
                <td>{calculos?.cargas_sociales || "N/A"}</td>
                <td>{calculos?.monto_rtn_neto || "N/A"}</td>
                <td>{calculos?.monto_neto || "N/A"}</td>
              </tr>
            </tbody>
          </table>

          {/* Detalle de Acciones de Personal */}
          <h5 style={{ fontWeight: 700, marginTop: 30 }}>Detalles de Acciones de personal:</h5>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>{empleado.nombre_completo_empleado_gestor}</div>
          <table className="table table-bordered table-sm mb-3">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Tipo de Acción</th>
                <th>Monto</th>
                <th>Tipo (+/-)</th>
              </tr>
            </thead>
            <tbody>
              {( // Usamos la misma estructura que la subtabla principal
                (() => {
                  // Generar los detalles para este empleado usando la función existente
                  // Si tienes la función generarDetalleSubtablaEmpleado, úsala aquí
                  // Si no, puedes copiar la lógica de generarDatosSubtabla para un solo empleado:
                  const detalles = [];
                  // Aumentos
                  if (aumentos && aumentos.length > 0) {
                    aumentos.forEach(a => detalles.push({
                      categoria: "Compensación Anual",
                      tipoAccion: "Aumento",
                      monto: formatMoney(a.monto_aumento_gestor, "$"),
                      tipo: "+",
                    }));
                  }
                  // Horas Extras
                  if (horasExtras && horasExtras.length > 0) {
                    horasExtras.forEach(h => detalles.push({
                      categoria: "Compensación Extra",
                      tipoAccion: "Ingreso",
                      monto: formatMoney(h.monto_compensacion_calculado_gestor, "$"),
                      tipo: "+",
                    }));
                  }
                  // Métricas
                  if (metricas && metricas.length > 0) {
                    metricas.forEach(m => detalles.push({
                      categoria: "Compensación por Métrica",
                      tipoAccion: "Ingreso",
                      monto: formatMoney(m.monto_compensacion_metrica_gestor, "$"),
                      tipo: "+",
                    }));
                  }
                  // Rebajos
                  if (rebajos && rebajos.length > 0) {
                    rebajos.forEach(r => detalles.push({
                      categoria: "Rebajo a Compensación",
                      tipoAccion: "Deducción",
                      monto: formatMoney(r.monto_rebajo_calculado, "$"),
                      tipo: "-",
                    }));
                  }
                  // RTN
                  // if (calculos?.monto_rtn_neto && calculos.monto_rtn_neto !== "N/A" && parseFloat(calculos.monto_rtn_neto.replace(/[^0-9.-]+/g,"")) > 0) {
                  //   detalles.push({
                  //     categoria: "RTN",
                  //     tipoAccion: "Deducción",
                  //     monto: calculos.monto_rtn_neto,
                  //     tipo: "-",
                  //   });
                  // }
                  // Cargas Sociales
                  if (calculos?.cargas_sociales && calculos.cargas_sociales !== "N/A" && parseFloat(calculos.cargas_sociales.replace(/[^0-9.-]+/g,"")) > 0) {
                    detalles.push({
                      categoria: "S.T.I CCSS",
                      tipoAccion: "Deducción",
                      monto: calculos.cargas_sociales,
                      tipo: "-",
                    });
                  }
                  return detalles.map((d, i) => (
                    <tr key={i}>
                      <td>{d.categoria}</td>
                      <td>{d.tipoAccion}</td>
                      <td>{d.monto}</td>
                      <td style={{ textAlign: "center" }}>{d.tipo}</td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>

          <div style={{ fontSize: 13, color: "#888", marginTop: 30, textAlign: "center" }}>
            <b>{tipoPlanillaLabel} {periodoLabel}</b><br />
            Importante: Este documento es una previsualización de la planilla, no se puede utilizar como comprobante de pago.
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ margin: "0 auto 1rem auto", display: "block" }}>
          Cerrar
        </button>
      </form>
      <style>{`
        .modal-dialog-custom {
          width: 95vw;
          max-width: 900px;
          border-radius: 10px;
          border: none;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        }
        @media (max-width: 600px) {
          .modal-dialog-custom { width: 99vw; }
        }
      `}</style>
    </dialog>
  );
};

export default ModalDetalleEmpleado;
