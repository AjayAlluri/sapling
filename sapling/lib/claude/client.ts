import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "@/lib/env.server";

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: serverEnv.anthropicApiKey!,
    });
  }
  return anthropicClient;
}
