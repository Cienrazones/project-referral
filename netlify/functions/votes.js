// functions/votes.js
import { withSecurity } from "../utils/security.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Tu handler original
const voteHandler = async (event) => {
  const { code_id, type } = JSON.parse(event.body);
  const userId = event.user.id; // Inyectado por withSecurity

  const { data, error } = await supabase
    .from("votes")
    .insert({ user_id: userId, code_id, type })
    .select()
    .single();

  if (error) throw error;

  return {
    statusCode: 201,
    body: JSON.stringify({ success: true, vote: data }),
  };
};

// Envolver con seguridad
export const handler = withSecurity(voteHandler, {
  requireAuth: true, // Requiere login
  rateLimit: { limit: 20, window: 60000 }, // 20 votos/min
  checkCsrf: true, // Validar CSRF
  csrfAction: "vote", // Acción específica
  allowedMethods: ["POST"], // Solo POST
});
