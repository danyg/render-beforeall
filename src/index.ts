import "@testing-library/react/dont-cleanup-after-each";
import { cleanup, render } from "@testing-library/react";
import { ReactElement } from "react";

const autoCleanup = Symbol("autoCleanup");
export const settings = {
  [autoCleanup]: true,
  disableAutoCleanup() {
    this[autoCleanup] = false;
  },
  enableAutoCleanup() {
    this[autoCleanup] = true;
  },
  isAutoCleanup(): boolean {
    return this[autoCleanup];
  },
};

export const renderBeforeAll = (createComponent: () => ReactElement): void => {
  beforeAll(() => {
    settings.disableAutoCleanup();
    render(createComponent());
  });

  afterAll(() => {
    cleanup();
    settings.enableAutoCleanup();
  });
};

afterEach(() => {
  if (settings.isAutoCleanup()) {
    cleanup();
  }
});
