import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BriefResult } from "@/components/BriefResult";
import { briefWithoutDependencies, validBrief } from "./fixtures";

function section(name: string): HTMLElement {
  return screen.getByRole("heading", { name }).closest("section") as HTMLElement;
}

describe("BriefResult", () => {
  it("renders every brief section", () => {
    render(
      <BriefResult brief={validBrief} copied={false} onCopy={() => {}} onReset={() => {}} />,
    );
    expect(screen.getByRole("heading", { name: "Yhteenveto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vaatimukset" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Riskit" })).toBeInTheDocument();
    expect(
      within(section("Vaatimukset")).getByText("Offline receipt capture"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pakollinen")).toBeInTheDocument();
  });

  it("lists requirement, external, and unknown dependencies with their source", () => {
    render(
      <BriefResult brief={validBrief} copied={false} onCopy={() => {}} onReset={() => {}} />,
    );
    const dependencies = section("Riippuvuudet ja järjestys");
    expect(within(dependencies).getByText("Vaatimus")).toBeInTheDocument();
    expect(within(dependencies).getByText("Ulkoinen")).toBeInTheDocument();
    expect(within(dependencies).getByText("Epäselvä")).toBeInTheDocument();
    expect(
      within(dependencies).getByText("Concur sync → R1 Offline receipt capture"),
    ).toBeInTheDocument();
    expect(
      within(dependencies).getByText(/Concur API rate limits.*\(oletus\)/),
    ).toBeInTheDocument();
  });

  it("renders cleanly when no dependencies were identified", () => {
    render(
      <BriefResult
        brief={briefWithoutDependencies}
        copied={false}
        onCopy={() => {}}
        onReset={() => {}}
      />,
    );
    expect(
      within(section("Riippuvuudet ja järjestys")).getByText(
        "Riippuvuuksia ei tunnistettu.",
      ),
    ).toBeInTheDocument();
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
