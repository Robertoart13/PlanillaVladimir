import React, { memo } from "react";

/**
 * Componente funcional que representa una tarjeta con un título, subtítulo y contenido.
 * Este componente se utiliza para mostrar información estructurada en una tarjeta con un encabezado.
 * 
 * Se utiliza `memo` para optimizar el rendimiento, asegurando que el componente solo se vuelva a renderizar
 * cuando sus props cambien. 
 * 
 * @param {Object} props - Propiedades pasadas al componente.
 * @param {ReactNode} props.children - Contenido que se muestra dentro de la tarjeta.
 * @param {string} props.texto - Título que se muestra en el encabezado de la tarjeta.
 * @param {string} props.subtitulo - Subtítulo que se muestra debajo del título en el encabezado de la tarjeta.
 * @returns {JSX.Element} - JSX que representa una tarjeta con un título, subtítulo y contenido.
 */
export const TarjetaRow = memo(({ children, texto, subtitulo }) => (
  <div className="row">
    <div className="col-sm-12">
      <div className="card">
        <div className="card-header">
          <h5>{texto}</h5>
          <small>{subtitulo}</small>
        </div>
        <div className="card-body">{children}</div>
      </div>
    </div>
  </div>
));

TarjetaRow.displayName = "TarjetaRow";