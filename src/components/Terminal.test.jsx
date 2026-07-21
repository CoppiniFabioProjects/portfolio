import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Terminal from "./Terminal";

function type(input, text) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("Terminal interattivo", () => {
  it("mostra il banner iniziale con il suggerimento 'help'", () => {
    render(<Terminal />);
    expect(screen.getByText(/Benvenuto nel terminale di Fabio/i)).toBeInTheDocument();
  });

  it("il comando whoami stampa nome e ruolo", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Terminale interattivo/i);
    type(input, "whoami");
    expect(screen.getByText(/Informatico Umanista/i)).toBeInTheDocument();
  });

  it("il comando tesi valorizza NLP/NLTK con un link", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Terminale interattivo/i);
    type(input, "tesi");
    expect(screen.getByText(/Python \+ NLTK/i)).toBeInTheDocument();
  });

  it("un comando sconosciuto suggerisce help", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Terminale interattivo/i);
    type(input, "xyzzy");
    expect(screen.getByText(/comando non trovato/i)).toBeInTheDocument();
  });

  it("clear pulisce lo schermo", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Terminale interattivo/i);
    type(input, "clear");
    expect(screen.queryByText(/Benvenuto nel terminale di Fabio/i)).not.toBeInTheDocument();
  });

  it("le frecce ripescano l'ultimo comando dalla cronologia", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Terminale interattivo/i);
    type(input, "whoami");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("whoami");
  });
});
