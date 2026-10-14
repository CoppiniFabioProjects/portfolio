import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// La lingua si legge da <html lang> al caricamento dei moduli:
// la imposto prima di importare il terminale (ogni file di test ha i suoi moduli).
let Terminal;
beforeAll(async () => {
  document.documentElement.lang = "en";
  ({ default: Terminal } = await import("./Terminal"));
});

function type(input, text) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("Terminal — versione inglese", () => {
  it("il banner è in inglese", () => {
    render(<Terminal />);
    expect(screen.getByText(/Welcome to Fabio's terminal/i)).toBeInTheDocument();
  });

  it("whoami usa il ruolo in inglese", () => {
    render(<Terminal />);
    type(screen.getByLabelText(/Interactive terminal/i), "whoami");
    expect(screen.getByText(/Digital Humanist/i)).toBeInTheDocument();
  });

  it("help elenca i comandi inglesi, e quelli italiani funzionano lo stesso", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Interactive terminal/i);
    type(input, "help");
    expect(screen.getByText("thesis")).toBeInTheDocument();
    expect(screen.getByText("open <n>")).toBeInTheDocument();
    type(input, "tesi");
    expect(screen.getByText(/Python \+ NLTK/i)).toBeInTheDocument();
  });

  it("errori in inglese", () => {
    render(<Terminal />);
    const input = screen.getByLabelText(/Interactive terminal/i);
    type(input, "boh");
    expect(screen.getByText(/command not found/i)).toBeInTheDocument();
    type(input, "open 99");
    expect(screen.getByText(/Project 99 not found/i)).toBeInTheDocument();
  });
});
