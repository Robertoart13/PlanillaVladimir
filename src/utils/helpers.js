const helpers = {};

// Manages and formats the API response
helpers.manageResponse = (res, data, error, status = 500) => {
   if (!res) {
      // No hay objeto de respuesta (por ejemplo, desde un cron job)
      if (!error) {
         console.log("✅ - Acción completada con éxito:", data);
         return data;
      } else {
         console.error("⛔ - Error ocurrido:", error);
         return;
      }
      
   }

   // Prevent sending multiple responses
   if (res.headersSent) {
      console.error("Headers already sent, skipping response.");
      return;
   }

   if (!error) {
      // Success case: send the data as a successful response
      return res.status(200).json(data);
   } else {
      // Error case: log the error and send a simplified error response
      console.error("Error occurred:", {
         message: error.message || error,
         stack: error.stack || "No stack trace available",
      });

      // Extract a simpler error message for the client response
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
         errorMessage = error.message;
      } else if (typeof error === "string") {
         errorMessage = error;
      } else {
         try {
            errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error));
         } catch (jsonError) {
            errorMessage = "Error converting the error to JSON";
         }
      }

      // Send the error response
      return res.status(status).json({ error: errorMessage });
   }
};

// Export the helpers object to be used elsewhere in the application
export default helpers;
