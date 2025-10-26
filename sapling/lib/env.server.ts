type ServerEnvKey = "SUPABASE_SERVICE_ROLE_KEY" | "ANTHROPIC_API_KEY";

function requireServerEnv(key: ServerEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const serverEnv = {
  supabaseServiceRoleKey: requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicApiKey: requireServerEnv("ANTHROPIC_API_KEY"),
};
