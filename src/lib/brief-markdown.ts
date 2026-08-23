import type { BriefInput, ProductBrief } from "@/lib/brief-schema";

const PRIORITY_LABEL = {
  must: "PAKOLLINEN",
  should: "SUOSITELTAVA",
  could: "MAHDOLLINEN",
} as const;

const SEVERITY_LABEL = {
  high: "KORKEA",
  medium: "KESKITASO",
  low: "MATALA",
} as const;

/** Deterministic Markdown rendering of a brief for copy/export. */
export function briefToMarkdown(
  brief: ProductBrief,
  input?: BriefInput,
): string {
  const lines: string[] = ["# Ominaisuussuunnitelma", ""];

  if (input?.productIdea?.trim()) {
    lines.push(`**Epic tai ominaisuus:** ${input.productIdea.trim()}`, "");
  }

  lines.push("## Yhteenveto", brief.summary.trim(), "");

  lines.push("## Oletukset");
  for (const assumption of brief.assumptions) {
    lines.push(`- ${assumption}`);
  }
  lines.push("");

  lines.push("## Vaatimukset");
  for (const requirement of brief.requirements) {
    lines.push(
      `- **[${PRIORITY_LABEL[requirement.priority]}] ${requirement.title}** — ${requirement.rationale}`,
    );
  }
  lines.push("");

  lines.push("## Hyväksymiskriteerit");
  for (const criterion of brief.acceptanceCriteria) {
    lines.push(`- ${criterion}`);
  }
  lines.push("");

  lines.push("## Riskit");
  for (const risk of brief.risks) {
    lines.push(
      `- **[${SEVERITY_LABEL[risk.severity]}] ${risk.risk}** — Hallintakeino: ${risk.mitigation}`,
    );
  }
  lines.push("");

  lines.push("## Kokeilut");
  for (const experiment of brief.experiments) {
    lines.push(
      `- **Hypoteesi:** ${experiment.hypothesis}`,
      `  - Menetelmä: ${experiment.method}`,
      `  - Onnistumismittari: ${experiment.successMetric}`,
    );
  }

  return lines.join("\n").trimEnd() + "\n";
}
