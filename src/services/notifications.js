import { supabase, isSupabaseConfigured } from '../utils/supabase';

/**
 * SERVICIO DE NOTIFICACIONES Y WEBHOOKS CONSCUGAR 2026
 * Soporta:
 * 1. Webhook directo a n8n / Make (si se define VITE_WEBHOOK_URL en el entorno)
 * 2. Supabase Edge Function 'resend-notification' (si se define VITE_ENABLE_EDGE_EMAIL='true')
 */
export const sendLeadNotifications = async (leadData, budget) => {
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
  const enableEdgeEmail = import.meta.env.VITE_ENABLE_EDGE_EMAIL === 'true';

  const payload = {
    source: 'conscugar_web_2026',
    timestamp: new Date().toISOString(),
    lead: {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      projectType: leadData.tipo,
      m2: Math.round(Number(leadData.m2) || 0),
      calidad: leadData.calidad,
      vivienda: leadData.vivienda,
      selectedExtras: leadData.selectedExtras || [],
      visitRequested: Boolean(leadData.visitRequested),
    },
    budget: {
      total: budget?.total || 0,
      min: budget?.min || 0,
      max: budget?.max || 0,
      breakdown: budget?.breakdown || {},
    },
  };

  try {
    // 1. Envío a Webhook de automatización (n8n / Make / CRM) si está configurado
    if (webhookUrl && webhookUrl.startsWith('http')) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    // 2. Envío mediante Supabase Edge Function (Resend) si está habilitado
    if (isSupabaseConfigured && enableEdgeEmail) {
      await supabase.functions.invoke('resend-notification', {
        body: {
          to: [leadData.email, 'info@conscugar.es'],
          subject: `Valoración Técnica Conscugar: ${leadData.name} (${budget?.total?.toLocaleString('es-ES')} €)`,
          ...payload,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Aviso: No se pudo disparar la notificación externa:', error);
    return { success: false, error };
  }
};
