"use client";

import { useRef, useState } from "react";

import { BriefForm } from "@/components/BriefForm";
import { BriefResult } from "@/components/BriefResult";
import { StatusBanner } from "@/components/StatusBanner";
import styles from "@/components/workbench.module.css";
import { briefToMarkdown } from "@/lib/brief-markdown";
import type {
  BriefInput,
  BriefResponse,
  ProductBrief,
} from "@/lib/brief-schema";
import { SAMPLE_BRIEF_INPUT } from "@/lib/sample-brief";

type Status = "idle" | "loading" | "success" | "error";

const EMPTY_INPUT: BriefInput = {
  productIdea: "",
  targetUsers: "",
  evidence: "",
  constraints: "",
};

interface ErrorState {
  message: string;
  fieldErrors?: Record<string, string>;
}

export default function Home() {
  const [values, setValues] = useState<BriefInput>(EMPTY_INPUT);
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<ProductBrief | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const isLoading = status === "loading";

  function updateField(field: keyof BriefInput, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);
    setBrief(null);
    setCopied(false);

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const data = (await response.json()) as BriefResponse;

      if (data.ok) {
        setBrief(data.brief);
        setStatus("success");
        return;
      }

      setError({
        message: data.error.message,
        fieldErrors: data.error.fieldErrors,
      });
      setStatus("error");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError({
        message:
          "Palveluun ei saatu yhteyttä. Tarkista verkkoyhteys ja yritä uudelleen.",
      });
      setStatus("error");
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  function handleLoadSample() {
    setValues(SAMPLE_BRIEF_INPUT);
    setError(null);
  }

  function handleReset() {
    abortRef.current?.abort();
    setValues(EMPTY_INPUT);
    setBrief(null);
    setError(null);
    setStatus("idle");
  }

  async function handleCopy() {
    if (!brief) return;
    const markdown = briefToMarkdown(brief, values);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const fieldErrors = error?.fieldErrors;
  const generalError = error && !error.fieldErrors ? error.message : null;

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <div className={styles.brand}>
            <span className={styles.wordmark}>Premise</span>
            <span className={styles.tagline}>
              Suunnittele ohjelmiston epicit ja ominaisuudet
            </span>
          </div>
        </div>
      </header>

      <main className={styles.shell}>
        <BriefForm
          values={values}
          fieldErrors={fieldErrors}
          isLoading={isLoading}
          onChange={updateField}
          onSubmit={handleSubmit}
          onLoadSample={handleLoadSample}
          onReset={handleReset}
          onCancel={handleCancel}
        />

        <div className={styles.result}>
          <p className="visually-hidden" role="status" aria-live="polite">
            {isLoading
              ? "Ominaisuussuunnitelmaa luodaan."
              : status === "success"
                ? "Ominaisuussuunnitelma on valmis."
                : generalError
                  ? `Virhe: ${generalError}`
                  : ""}
          </p>

          {fieldErrors ? (
            <StatusBanner
              variant="error"
              title="Tarkista lomake"
              message="Korjaa merkityt kentät ja yritä uudelleen."
            />
          ) : null}

          {isLoading ? (
            <LoadingSkeleton />
          ) : brief ? (
            <BriefResult
              brief={brief}
              copied={copied}
              onCopy={handleCopy}
              onReset={handleReset}
            />
          ) : generalError ? (
            <StatusBanner
              variant="error"
              title="Suunnitelmaa ei voitu luoda"
              message={generalError}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Premise — epic- ja ominaisuussuunnittelun demoapuri.</span>
          <span>
            Malli tarjotaan Microsoft Foundrysta Azure API Managementin kautta.
          </span>
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>Ei ominaisuussuunnitelmaa vielä</p>
      <p>
        Kuvaa epic tai ominaisuus vasemmalla tai lataa esimerkki ja luo sitten
        toteutuskelpoinen suunnitelma.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {[68, 92, 80, 40, 88, 74, 60].map((width, index) => (
        <div
          className={styles.skelLine}
          key={index}
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}
