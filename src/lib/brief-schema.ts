import { z } from "zod";

/**
 * Shared contracts for Premise. These schemas are the single source of truth for
 * form validation, API request validation, model-output parsing, and inferred
 * TypeScript types. If the model returns something off-contract, parsing fails
 * loudly here instead of rendering a broken brief.
 */

export const PRIORITY_VALUES = ["must", "should", "could"] as const;
export const SEVERITY_VALUES = ["low", "medium", "high"] as const;

export const briefInputSchema = z.object({
  productIdea: z
    .string()
    .trim()
    .min(20, "Kuvaa epic tai ominaisuus vähintään 20 merkillä.")
    .max(2000, "Epicin tai ominaisuuden kuvaus saa sisältää enintään 2 000 merkkiä."),
  productContext: z
    .string()
    .trim()
    .max(2000, "Nykytilan kuvaus saa sisältää enintään 2 000 merkkiä.")
    .optional()
    .default(""),
  targetUsers: z
    .string()
    .trim()
    .min(10, "Kuvaa kohdekäyttäjät vähintään 10 merkillä.")
    .max(1000, "Kohdekäyttäjien kuvaus saa sisältää enintään 1 000 merkkiä."),
  evidence: z
    .string()
    .trim()
    .min(10, "Lisää näyttöä tai kipupisteitä vähintään 10 merkillä.")
    .max(2000, "Näyttö saa sisältää enintään 2 000 merkkiä."),
  constraints: z
    .string()
    .trim()
    .max(1000, "Reunaehdot saavat sisältää enintään 1 000 merkkiä.")
    .optional()
    .default(""),
});

export const problemSchema = z.object({
  statement: z.string().min(1),
  currentState: z.string().min(1),
  impact: z.string().min(1),
});

export const desiredOutcomeSchema = z.object({
  statement: z.string().min(1),
  successIndicators: z.array(z.string().min(1)).min(1),
});

export const requirementSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  priority: z.enum(PRIORITY_VALUES),
});

export const riskSchema = z.object({
  risk: z.string().min(1),
  mitigation: z.string().min(1),
  severity: z.enum(SEVERITY_VALUES),
});

export const experimentSchema = z.object({
  hypothesis: z.string().min(1),
  method: z.string().min(1),
  successMetric: z.string().min(1),
});

export const productBriefSchema = z.object({
  summary: z.string().min(1),
  problem: problemSchema,
  desiredOutcome: desiredOutcomeSchema,
  assumptions: z.array(z.string().min(1)).min(1),
  requirements: z.array(requirementSchema).min(1),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
  risks: z.array(riskSchema).min(1),
  experiments: z.array(experimentSchema).min(1),
});

export type BriefInput = z.infer<typeof briefInputSchema>;
export type Problem = z.infer<typeof problemSchema>;
export type DesiredOutcome = z.infer<typeof desiredOutcomeSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type Risk = z.infer<typeof riskSchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type ProductBrief = z.infer<typeof productBriefSchema>;

export type Priority = (typeof PRIORITY_VALUES)[number];
export type Severity = (typeof SEVERITY_VALUES)[number];

/** Stable success/error envelope returned by the brief API. */
export type BriefErrorCode =
  | "invalid_input"
  | "not_configured"
  | "unauthorized"
  | "rate_limited"
  | "timeout"
  | "invalid_model_output"
  | "service_error";

export interface BriefSuccessResponse {
  ok: true;
  brief: ProductBrief;
}

export interface BriefErrorResponse {
  ok: false;
  error: {
    code: BriefErrorCode;
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export type BriefResponse = BriefSuccessResponse | BriefErrorResponse;

/**
 * JSON schema handed to the model via structured outputs. It is kept in lockstep
 * with productBriefSchema on purpose — update both together.
 */
export const productBriefJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "problem",
    "desiredOutcome",
    "assumptions",
    "requirements",
    "acceptanceCriteria",
    "risks",
    "experiments",
  ],
  properties: {
    summary: { type: "string" },
    problem: {
      type: "object",
      additionalProperties: false,
      required: ["statement", "currentState", "impact"],
      properties: {
        statement: { type: "string" },
        currentState: { type: "string" },
        impact: { type: "string" },
      },
    },
    desiredOutcome: {
      type: "object",
      additionalProperties: false,
      required: ["statement", "successIndicators"],
      properties: {
        statement: { type: "string" },
        successIndicators: { type: "array", items: { type: "string" } },
      },
    },
    assumptions: { type: "array", items: { type: "string" } },
    requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "rationale", "priority"],
        properties: {
          title: { type: "string" },
          rationale: { type: "string" },
          priority: { type: "string", enum: [...PRIORITY_VALUES] },
        },
      },
    },
    acceptanceCriteria: { type: "array", items: { type: "string" } },
    risks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["risk", "mitigation", "severity"],
        properties: {
          risk: { type: "string" },
          mitigation: { type: "string" },
          severity: { type: "string", enum: [...SEVERITY_VALUES] },
        },
      },
    },
    experiments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["hypothesis", "method", "successMetric"],
        properties: {
          hypothesis: { type: "string" },
          method: { type: "string" },
          successMetric: { type: "string" },
        },
      },
    },
  },
} as const;
