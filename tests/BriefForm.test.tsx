import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { BriefForm } from "@/components/BriefForm";
import type { BriefInput } from "@/lib/brief-schema";

const EMPTY: BriefInput = {
  productIdea: "",
  productContext: "",
  targetUsers: "",
  evidence: "",
  constraints: "",
};

function Harness(props: {
  onSubmit?: () => void;
  onLoadSample?: () => void;
  fieldErrors?: Record<string, string>;
}) {
  const [values, setValues] = useState<BriefInput>(EMPTY);
  return (
    <BriefForm
      values={values}
      fieldErrors={props.fieldErrors}
      isLoading={false}
      onChange={(field, value) =>
        setValues((prev) => ({ ...prev, [field]: value }))
      }
      onSubmit={props.onSubmit ?? (() => {})}
      onLoadSample={props.onLoadSample ?? (() => {})}
      onReset={() => setValues(EMPTY)}
      onCancel={() => {}}
    />
  );
}

describe("BriefForm", () => {
  it("captures typed input", async () => {
    render(<Harness />);
    const idea = screen.getByLabelText(/Epic tai ominaisuus/);
    await userEvent.type(idea, "A new idea");
    expect(idea).toHaveValue("A new idea");
  });

  it("offers an optional current-state field", async () => {
    render(<Harness />);
    const context = screen.getByLabelText(/Nykytila/);
    await userEvent.type(context, "Nykyinen portaali");
    expect(context).toHaveValue("Nykyinen portaali");
  });

  it("submits the form", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Luo suunnitelma" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("loads the example on request", async () => {
    const onLoadSample = vi.fn();
    render(<Harness onLoadSample={onLoadSample} />);
    await userEvent.click(screen.getByRole("button", { name: "Lataa esimerkki" }));
    expect(onLoadSample).toHaveBeenCalledOnce();
  });

  it("marks fields invalid and shows an alert when there are errors", () => {
    render(<Harness fieldErrors={{ productIdea: "Too short" }} />);
    const idea = screen.getByLabelText(/Epic tai ominaisuus/);
    expect(idea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
  });
});
