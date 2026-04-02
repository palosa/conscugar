/**
 * SERVICIO DE NOTIFICACIONES CONSCUGAR (PREPARED FOR RESEND)
 * 
 * Este servicio está listo para integrarse con Resend.com.
 * El método recomendado es llamar a una Edge Function de Supabase para no exponer la API Key en el cliente.
 */

export const sendLeadNotifications = async (leadData, budget) => {
  console.log("🔔 [Notificaciones] Preparando envío para Resend...", { leadData, total: budget.total });

  try {
    /**
     * PASOS PARA ACTIVAR RESEND EN EL FUTURO:
     * 1. Crear cuenta en Resend.com
     * 2. Crear una Supabase Edge Function (ej: 'resend-notification')
     * 3. Descomentar el bloque inferior y configurar la URL.
     */

    /*
    const { data, error } = await supabase.functions.invoke('resend-notification', {
      body: {
        to: [leadData.email, 'admin@conscugar.es'],
        subject: `Nuevo Presupuesto: ${leadData.name} - ${budget.total}€`,
        lead: leadData,
        budget: budget
      }
    });
    */

    // Simulación de éxito para el flujo actual
    return { success: true, message: "Simulación de Resend completada (Modo Preparación)" };

  } catch (error) {
    console.error("❌ Error en el servicio de notificaciones:", error);
    return { success: false, error };
  }
};
