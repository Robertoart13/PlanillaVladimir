/**
 * Función para formatear valores monetarios con separadores de miles
 * @param {number|string} value - Valor a formatear
 * @returns {string} Valor formateado con separadores de miles
 */
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "₡0.00";
    return (
       "₡" +
       Number(value)
          .toLocaleString("en-US", {
             minimumFractionDigits: 2,
             maximumFractionDigits: 2,
          })
    );
 };
 
 export default formatCurrency;