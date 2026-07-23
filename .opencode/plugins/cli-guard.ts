import type { Plugin } from "@opencode-ai/plugin"

const RULES = [
  {
    pattern: /^(?:bun\s+)?npm\s+(install|i|add|remove|uninstall)\b/,
    message:
      "Use `bunx expo install <package>` instead of npm install — this project uses Expo and bun.",
  },
  {
    // `gh` commands that do actual work — allow informational queries
    pattern: /^gh\s+(?!help\b|--help\b|version\b|--version\b|auth\b|completion\b)(?!\s*$)/,
    message:
      "Use the gh-axi skill instead of raw `gh` — it provides a structured wrapper around GitHub operations.",
  },
  {
    pattern: /^npx\s+(expo-cli\b|create-expo-app\b)/,
    message:
      "Use `bunx` instead of `npx` — this project uses bun.",
  },
]

function matchRule(command: string) {
  const trimmed = command.trim()
  for (const rule of RULES) {
    if (rule.pattern.test(trimmed)) {
      return rule
    }
  }
  return null
}

export const CliGuard: Plugin = async () => {
  return {
    "tool.execute.before": async (_input, output) => {
      const tool = String(_input?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return

      const args = output?.args as Record<string, unknown> | undefined
      if (!args || typeof args.command !== "string") return

      const command = args.command.trim()
      const matched = matchRule(command)
      if (!matched) return

      args.command = `echo "⛔ BLOCKED: ${matched.message}" && exit 1`
    },
  }
}