import { useEffect } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-searchpanes-bs5";
import "datatables.net-select-bs5";
import { getDataTableConfig } from "./getDataTableConfig";

/**
 * Custom React hook for initializing, managing, and cleaning up jQuery DataTables.
 * 
 * This hook handles the complete lifecycle of a DataTable instance:
 * - Initializes the DataTable with the provided configuration
 * - Handles cleanup when the component unmounts
 * - Provides error handling for initialization failures
 * 
 * @param {React.RefObject} tableRef - React ref object pointing to the table DOM element
 * @param {React.MutableRefObject} tableInstanceRef - React ref object to store the DataTable instance
 * @param {Function} setError - Function to set error state when DataTable initialization fails
 * @param {Array<number>} filterColumns - Array of column indices to enable filtering on
 * @param {Array<Object>} COLUMNS - Column definitions for the DataTable configuration
 * 
 * @example
 * // In a React component:
 * const tableRef = useRef(null);
 * const tableInstanceRef = useRef(null);
 * const [error, setError] = useState(null);
 * 
 * useDataTable(tableRef, tableInstanceRef, setError, [0, 1, 2], COLUMNS);
 * 
 * return (
 *   <>
 *     {error && <div className="alert alert-danger">{error}</div>}
 *     <table ref={tableRef}>...</table>
 *   </>
 * );
 */
export const useDataTable = (tableRef, tableInstanceRef, setError, filterColumns, COLUMNS) => {

   useEffect(() => {
      const initializeTable = () => {
         if (!tableRef.current) return;

         try {
            // Destruir instancia existente
            if (tableInstanceRef.current) {
               $(tableRef.current).off('click', 'tbody tr');
               tableInstanceRef.current.destroy();
            }

            // Inicializar nueva instancia
            tableInstanceRef.current = $(tableRef.current).DataTable(getDataTableConfig(filterColumns, COLUMNS));

         } catch (err) {
            console.error("Error initializing DataTable:", err);
            setError("Error al inicializar la tabla. Por favor, recargue la página.");
         }
      };

      initializeTable();

      return () => {
         if (tableInstanceRef.current) {
            $(tableRef.current).off("click", "tbody tr");
            tableInstanceRef.current.destroy();
            tableInstanceRef.current = null;
         }
      };
   }, [tableRef, tableInstanceRef, setError, filterColumns, COLUMNS]);
};