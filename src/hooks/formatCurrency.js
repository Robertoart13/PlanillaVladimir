// hooks/formatCurrency.js

/**
 * Formatea un valor como colones (CRC)
 */
const formatCurrency = (value) => {
   if (value === null || value === undefined || isNaN(value)) return "₡0.00";
   return (
     "₡" +
     Number(value).toLocaleString("en-US", {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     })
   );
 };
 
 /**
  * Formatea un valor como dólares (USD)
  */
 const formatCurrencyUSD = (value) => {
   if (value === null || value === undefined || isNaN(value)) return "$0.00";
   return Number(value).toLocaleString("en-US", {
     style: "currency",
     currency: "USD",
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   });
 };

/**
 * Determina qué función de formateo usar basándose en la moneda de la planilla
 * @param {string} moneda - Moneda de la planilla ('colones', 'dolares', 'dólares', etc.)
 * @param {number|string} value - Valor a formatear
 * @returns {string} Valor formateado con el símbolo de moneda correspondiente
 */
const formatCurrencyByPlanilla = (moneda, value) => {
   switch (moneda?.toLowerCase()) {
      case 'dolares':
      case 'dólares':
         return formatCurrencyUSD(value);
      case 'colones':
      default:
         return formatCurrency(value);
   }
};

/**
 * Obtiene el símbolo de moneda basado en la moneda de la planilla
 * @param {string} moneda - Moneda de la planilla ('colones', 'dolares', etc.)
 * @returns {string} Símbolo de moneda
 */
const getMonedaSymbol = (moneda) => {
   switch (moneda?.toLowerCase()) {
      case 'dolares':
      case 'dólares':
         return '$';
      case 'colones':
      default:
         return '₡';
   }
};

 
 export { formatCurrencyUSD, formatCurrency, formatCurrencyByPlanilla, getMonedaSymbol };
 