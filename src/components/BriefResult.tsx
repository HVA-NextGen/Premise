"use client";

import type {
  Priority,
  ProductBrief,
  Severity,
} from "@/lib/brief-schema";
import styles from "@/components/workbench.module.css";

const PRIORITY_CLASS: Record<Priority, string> = {
  must: styles.tagMust,
  should: styles.tagShould,
  could: styles.tagCould,
};

const SEVERITY_CLASS: Record<Severity, string> = {
  high: styles.tagHigh,
  medium: styles.tagMedium,
  low: styles.tagLow,
};

const PRIORITY_LABEL: Record<Priority, string> = {
  must: "Pakollinen",
  should: "Suositeltava",
  could: "Mahdollinen",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Korkea",
  medium: "Keskitaso",
  low: "Matala",
};

interface BriefResultProps {
  brief: ProductBrief;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
}

export function BriefResult({
  brief,
  copied,
  onCopy,
  onReset,
}: BriefResultProps) {
  return (
    <article aria-labelledby="brief-heading" className={styles.result}>
      <header className={styles.resultHead}>
        <div>
          <p className={styles.eyebrow}>Luotu suunnitelma</p>
          <h2 id="brief-heading" className={styles.resultTitle}>
            Ominaisuussuunnitelma
          </h2>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.ghost}`}
            onClick={onCopy}
          >
            {copied ? "Kopioitu" : "Kopioi Markdownina"}
          </button>
          <button type="button" className={styles.linkButton} onClick={onReset}>
            Aloita alusta
          </button>
        </div>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Yhteenveto</h3>
        <p className={styles.summary}>{brief.summary}</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ongelma</h3>
        <p className={styles.summary}>{brief.problem.statement}</p>
        <ul className={styles.bulletList}>
          <li>Nykytila: {brief.problem.currentState}</li>
          <li>Vaikutus: {brief.problem.impact}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tavoiteltu lopputulos</h3>
        <p className={styles.summary}>{brief.desiredOutcome.statement}</p>
        <ul className={styles.bulletList}>
          {brief.desiredOutcome.successIndicators.map((indicator, index) => (
            <li key={index}>{indicator}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Oletukset</h3>
        <ul className={styles.bulletList}>
          {brief.assumptions.map((assumption, index) => (
            <li key={index}>{assumption}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Vaatimukset</h3>
        <ul className={styles.list}>
          {brief.requirements.map((requirement, index) => (
            <li className={styles.item} key={index}>
              <span className={`${styles.tag} ${PRIORITY_CLASS[requirement.priority]}`}>
                {PRIORITY_LABEL[requirement.priority]}
              </span>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{requirement.title}</p>
                <p className={styles.itemMeta}>{requirement.rationale}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Hyväksymiskriteerit</h3>
        <ul className={styles.checkList}>
          {brief.acceptanceCriteria.map((criterion, index) => (
            <li className={styles.checkItem} key={index}>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Riskit</h3>
        <ul className={styles.list}>
          {brief.risks.map((risk, index) => (
            <li className={styles.item} key={index}>
              <span className={`${styles.tag} ${SEVERITY_CLASS[risk.severity]}`}>
                {SEVERITY_LABEL[risk.severity]}
              </span>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{risk.risk}</p>
                <p className={styles.itemMeta}>Hallintakeino: {risk.mitigation}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Kokeilut</h3>
        <ul className={styles.list}>
          {brief.experiments.map((experiment, index) => (
            <li className={styles.item} key={index}>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{experiment.hypothesis}</p>
                <p className={styles.itemMeta}>Menetelmä: {experiment.method}</p>
                <p className={styles.itemMeta}>
                  Onnistumismittari: {experiment.successMetric}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
