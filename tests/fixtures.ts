import type { BriefInput, ProductBrief } from "@/lib/brief-schema";

export const validInput: BriefInput = {
  productIdea:
    "A mobile expense capture app for field technicians to log receipts between jobs.",
  targetUsers: "HVAC technicians who visit many sites a day.",
  evidence: "30% of expense reports are submitted late according to support data.",
  constraints: "Must work offline and integrate with SAP Concur.",
};

export const validBrief: ProductBrief = {
  summary: "A focused mobile tool that removes friction from expense capture.",
  assumptions: ["Technicians carry a smartphone on every job."],
  requirements: [
    {
      id: "R1",
      title: "Offline receipt capture",
      rationale: "Signal is unreliable at many sites.",
      priority: "must",
      dependencies: [
        {
          type: "external",
          requirementId: null,
          description: "Mobile platform team must ship the shared storage module.",
          assumption: false,
        },
      ],
    },
    {
      id: "R2",
      title: "Concur sync",
      rationale: "Avoids double entry into the system of record.",
      priority: "should",
      dependencies: [
        {
          type: "requirement",
          requirementId: "R1",
          description: "Sync needs locally captured receipts to exist first.",
          assumption: false,
        },
        {
          type: "unknown",
          requirementId: null,
          description: "Concur API rate limits are not documented in the evidence.",
          assumption: true,
        },
      ],
    },
  ],
  acceptanceCriteria: [
    "A receipt captured offline syncs automatically when back online.",
  ],
  risks: [
    {
      risk: "Poor OCR accuracy on crumpled receipts.",
      mitigation: "Allow manual correction before submit.",
      severity: "medium",
    },
  ],
  experiments: [
    {
      hypothesis: "Offline capture reduces late submissions.",
      method: "Pilot with one region for a month.",
      successMetric: "Late submissions drop below 10%.",
    },
  ],
};

/** A brief whose requirements declare no dependencies at all. */
export const briefWithoutDependencies: ProductBrief = {
  ...validBrief,
  requirements: validBrief.requirements.map((requirement) => ({
    ...requirement,
    dependencies: [],
  })),
};
