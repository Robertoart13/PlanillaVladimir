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


 
 export { formatCurrencyUSD, formatCurrency };
 