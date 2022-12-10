import "@testing-library/jest-dom";
import * as React from "react";

import { renderBeforeAll } from "./index"; // SUPER IMPORTANT IMPORT ORDER, THIS MUST GO BEFORE IMPORTING "@testing-library/react"
import { render, screen } from "@testing-library/react";

describe("renderBeforeAll", () => {
  let counter = 0;
  const SillyComponent: React.FC = () => {
    counter++;
    return <h1>A silly component</h1>;
  };

  describe("GIVEN developer use renderBeforeAll", () => {
    renderBeforeAll(() => <SillyComponent />);

    it("the rendered component is render for at least one test", () => {
      expect(screen.queryByText("A silly component")).toBeInTheDocument();
      expect(counter).toBe(1);
    });

    it("the rendered component is render for many tests", () => {
      expect(screen.queryByText("A silly component")).toBeInTheDocument();
      expect(counter).toBe(1);
    });
  });

  it("and should not be rendered outside the describe where it was called", () => {
    expect(counter).toBe(1);
    expect(screen.queryByText("A silly component")).not.toBeInTheDocument();
  });

  it("should allow to render normally with the cleanup after the test", () => {
    render(<SillyComponent />);
    expect(screen.queryByText("A silly component")).toBeInTheDocument();
  });

  it("Should not be rendered after a previous test called render", () => {
    expect(screen.queryByText("A silly component")).not.toBeInTheDocument();
  });
});
