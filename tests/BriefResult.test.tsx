import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BriefResult } from "@/components/BriefResult";
import { validBrief } from "./fixtures";

describe("BriefResult", () => {
  it("renders every brief section", () => {
    render(
      <BriefResult brief={validBrief} copied={false} onCopy={() => {}} onReset={() => {}} />,
    );
    expect(screen.getByRole("heading", { name: "Yhteenveto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vaatimukset" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Riskit" })).toBeInTheDocument();
    expect(screen.getByText("Offline receipt capture")).toBeInTheDocument();
    expect(screen.getByText("Pakollinen")).toBeInTheDocument();
  });

  it("labels the region for assistive tech", () => {
    render(
      <BriefResult brief={validBrief} copied={false} onCopy={() => {}} onReset={() => {}} />,
    );
    expect(
      screen.getByRole("article", { name: "Ominaisuussuunnitelma" }),
    ).toBeInTheDocument();
  });

  it("invokes copy and shows copied state", async () => {
    const onCopy = vi.fn();
    const { rerender } = render(
      <BriefResult brief={validBrief} copied={false} onCopy={onCopy} onReset={() => {}} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Kopioi Markdownina" }));
    expect(onCopy).toHaveBeenCalledOnce();

    rerender(
      <BriefResult brief={validBrief} copied onCopy={onCopy} onReset={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Kopioitu" })).toBeInTheDocument();
  });
});
