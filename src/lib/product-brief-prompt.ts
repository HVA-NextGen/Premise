import type { BriefInput } from "@/lib/brief-schema";

/**
 * Prompt construction for Premise lives here so prompt changes are reviewable
 * and unit-testable in isolation from transport and UI concerns.
 */

export const BRIEF_SYSTEM_PROMPT = [
  "You are a senior software product manager who turns proposed epics and features",
  "for existing software products into crisp, implementation-ready feature plans.",
  "You are pragmatic, evidence-driven, and honest",
  "about uncertainty.",
  "",
  "Given an epic or feature, its target users, supporting evidence, and constraints,",
  "produce a structured plan that a software delivery team could act on this week.",
  "",
  "Rules:",
  "- Ground every requirement in the supplied evidence or an explicitly stated assumption.",
  "- Prioritize with MoSCoW: use 'must', 'should', or 'could'.",
  "- Acceptance criteria must be specific and testable.",
  "- Each risk needs a concrete mitigation and a severity of 'low', 'medium', or 'high'.",
  "- Each experiment needs a falsifiable hypothesis, a method, and a measurable success metric.",
  "- Do not invent facts that contradict the input. Prefer stating an assumption.",
  "- Write all free-text values in the predominant language of the user inputs.",
  "- Respond only with the structured object defined by the response schema.",
].join("\n");

export function buildBriefUserPrompt(input: BriefInput): string {
  const constraints = input.constraints?.trim()
    ? input.constraints.trim()
    : "None provided.";

  return [
    "Create an implementation-ready software feature plan from the following inputs.",
    "",
    "## Epic or feature",
    input.productIdea.trim(),
    "",
    "## Target users",
    input.targetUsers.trim(),
    "",
    "## Evidence and pain points",
    input.evidence.trim(),
    "",
    "## Constraints",
    constraints,
  ].join("\n");
}

export function buildBriefMessages(input: BriefInput) {
  return [
    { role: "system" as const, content: BRIEF_SYSTEM_PROMPT },
    { role: "user" as const, content: buildBriefUserPrompt(input) },
  ];
}
