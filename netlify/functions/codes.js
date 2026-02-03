// functions/codes.js
import { withSecurity } from "../utils/security.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Crear código
const createCodeHandler = async (event) => {
  const { app_name, code, description, category_id } = JSON.parse(event.body);
  const userId = event.user.id;

  const { data, error } = await supabase
    .from("codes")
    .insert({
      app_name,
      code,
      description,
      category_id,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    statusCode: 201,
    body: JSON.stringify({ success: true, code: data }),
  };
};

// Envolver con seguridad
export const handler = withSecurity(createCodeHandler, {
  requireAuth: true,
  rateLimit: { limit: 10, window: 3600000 }, // 10 códigos/hora
  checkCsrf: true,
  csrfAction: "create_code",
  allowedMethods: ["POST"],
  sanitizeBody: true, // Sanitizar inputs automáticamente
});
