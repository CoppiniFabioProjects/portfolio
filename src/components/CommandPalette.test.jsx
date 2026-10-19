import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CommandPalette from "./CommandPalette";
import Nav from "./Nav";

const input = () => screen.getByRole("combobox");
// testo delle voci, senza il numero di sezione (".05")
const options = () => screen.queryAllByRole("option").map((o) => o.textContent.replace(/^\.\d+/, ""));

describe("Palette dei comandi", () => {
  it("mostra sezioni e azioni", () => {
    render(<CommandPalette open onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(options()).toEqual(expect.arrayContaining(["Chi sono", "Progetti", "Dal campo", "Scarica il CV (PDF)"]));
  });

  it("filtra per parola chiave, anche in inglese e senza accenti", () => {
    render(<CommandPalette open onClose={() => {}} />);
    fireEvent.change(input(), { target: { value: "resume" } });
    expect(options()).toEqual(["Scarica il CV (PDF)"]);
    fireEvent.change(input(), { target: { value: "progetti" } });
    expect(options()).toEqual(["Progetti"]);
  });

  it("dice quando non trova niente", () => {
    render(<CommandPalette open onClose={() => {}} />);
    fireEvent.change(input(), { target: { value: "zzzz" } });
    expect(options()).toEqual([]);
    expect(screen.getByText(/Nessun risultato/)).toBeInTheDocument();
  });

  it("Invio sulla voce scelta: copia l'email e lo conferma", async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CommandPalette open onClose={() => {}} />);
    fireEvent.change(input(), { target: { value: "copia" } });
    await act(async () => { fireEvent.keyDown(input(), { key: "Enter" }); });
    expect(writeText).toHaveBeenCalledWith("coppinifabio99@gmail.com");
    expect(screen.getByRole("status")).toHaveTextContent("Email copiata");
  });

  it("Esc chiude", () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} />);
    fireEvent.keyDown(input(), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Scorciatoie della barra", () => {
  it("Ctrl+K apre la palette, \"/\" mentre si scrive in un campo no", () => {
    render(
      <>
        <input aria-label="campo" />
        <Nav />
      </>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByLabelText("campo"), { key: "/" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
