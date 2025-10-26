const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};

if (!serverEnv.supabaseServiceRoleKey) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}

if (!serverEnv.anthropicApiKey) {
  throw new Error("Missing environment variable: ANTHROPIC_API_KEY");
}

export { serverEnv };
