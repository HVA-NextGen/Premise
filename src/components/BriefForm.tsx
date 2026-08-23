"use client";

import type { BriefInput } from "@/lib/brief-schema";
import styles from "@/components/workbench.module.css";

type FieldName = keyof BriefInput;

interface FieldConfig {
  name: FieldName;
  label: string;
  hint: string;
  placeholder: string;
  multiline: boolean;
  optional?: boolean;
}

const FIELDS: FieldConfig[] = [
  {
    name: "productIdea",
    label: "Epic tai ominaisuus",
    hint: "Mitä nykyisen ohjelmiston toiminnallisuutta suunnittelet ja miksi juuri nyt?",
    placeholder: "Yhtenäinen lääkitysnäkymä potilastietojärjestelmään…",
    multiline: true,
  },
  {
    name: "targetUsers",
    label: "Kohdekäyttäjät",
    hint: "Kenelle tämä on tarkoitettu? Kuvaa käyttötilanne tarkasti.",
    placeholder: "Perusterveydenhuollon lääkärit ja hoitajat…",
    multiline: true,
  },
  {
    name: "evidence",
    label: "Näyttö ja kipupisteet",
    hint: "Mitkä havainnot osoittavat, että tämä kannattaa toteuttaa?",
    placeholder: "Käyttöanalytiikan mukaan ammattilaisilta kuluu…",
    multiline: true,
  },
  {
    name: "constraints",
    label: "Reunaehdot",
    hint: "Valinnainen. Aikataulu, alustat ja integroitavat järjestelmät.",
    placeholder: "Ratkaisun on täytettävä GDPR-vaatimukset ja käytettävä FHIR-rajapintoja…",
    multiline: true,
    optional: true,
  },
];

interface BriefFormProps {
  values: BriefInput;
  fieldErrors?: Record<string, string>;
  isLoading: boolean;
  onChange: (field: FieldName, value: string) => void;
  onSubmit: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onCancel: () => void;
}

export function BriefForm({
  values,
  fieldErrors,
  isLoading,
  onChange,
  onSubmit,
  onLoadSample,
  onReset,
  onCancel,
}: BriefFormProps) {
  return (
    <section className={styles.panel} aria-label="Laadi ominaisuussuunnitelma">
      <div className={styles.panelHead}>
        <div>
          <p className={styles.eyebrow}>Lähtötiedot</p>
        </div>
        <button
          type="button"
          className={styles.linkButton}
          onClick={onLoadSample}
          disabled={isLoading}
        >
          Lataa esimerkki
        </button>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        {FIELDS.map((field) => {
          const error = fieldErrors?.[field.name];
          const errorId = `${field.name}-error`;
          const hintId = `${field.name}-hint`;
          const commonProps = {
            id: field.name,
            name: field.name,
            value: values[field.name] ?? "",
            "aria-describedby": error ? `${hintId} ${errorId}` : hintId,
            "aria-invalid": error ? true : undefined,
            onChange: (
              event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement
              >,
            ) => onChange(field.name, event.target.value),
          };

          return (
            <div className={styles.field} key={field.name}>
              <label className={styles.label} htmlFor={field.name}>
                {field.label}
                {field.optional ? (
                  <span className={styles.hint}> (valinnainen)</span>
                ) : null}
              </label>
              <span className={styles.hint} id={hintId}>
                {field.hint}
              </span>
              <textarea
                {...commonProps}
                className={`${styles.textarea} ${error ? styles.invalid : ""}`}
                placeholder={field.placeholder}
                rows={field.name === "productIdea" ? 3 : 2}
              />
              {error ? (
                <span className={styles.fieldError} id={errorId} role="alert">
                  {error}
                </span>
              ) : null}
            </div>
          );
        })}

        <div className={styles.actions}>
          {isLoading ? (
            <button
              type="button"
              className={`${styles.button} ${styles.ghost}`}
              onClick={onCancel}
            >
              Peruuta
            </button>
          ) : (
            <button type="submit" className={`${styles.button} ${styles.primary}`}>
              Luo suunnitelma
            </button>
          )}
          <button
            type="button"
            className={styles.linkButton}
            onClick={onReset}
            disabled={isLoading}
          >
            Tyhjennä
          </button>
        </div>
      </form>
    </section>
  );
}
