import type { Dependency, ProductBrief, Requirement } from "@/lib/brief-schema";

/** One dependency flattened together with its source and resolved target. */
export interface DependencyLink {
  requirement: Requirement;
  dependency: Dependency;
  /** The referenced requirement, or null for external and unknown blockers. */
  target: Requirement | null;
}

/**
 * Flattens the per-requirement dependencies into the consolidated sequencing
 * view used by both the result UI and the Markdown export.
 */
export function collectDependencyLinks(brief: ProductBrief): DependencyLink[] {
  const byId = new Map(brief.requirements.map((requirement) => [requirement.id, requirement]));

  return brief.requirements.flatMap((requirement) =>
    requirement.dependencies.map((dependency) => ({
      requirement,
      dependency,
      target: dependency.requirementId
        ? (byId.get(dependency.requirementId) ?? null)
        : null,
    })),
  );
}
