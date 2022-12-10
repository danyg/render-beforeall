- [Installation](#installation)
  - [Jest](#jest)
  - [Mocha](#mocha)
- [How To Use it](#how-to-use-it)
  - [Advanced use](#advanced-use)
- [Best Practices](#best-practices)
  - [One State per describe](#one-state-per-describe)
    - [BAD example](#bad-example)
    - [Good Example](#good-example)
- [Description, notes, motivations and alternatives](#description-notes-motivations-and-alternatives)
  - [You might violate F.I.R.S.T.](#you-might-violate-first)
  - [Conclusion](#conclusion)
- [Examples](#examples)
  - [Form](#form)
  - [Several States](#several-states)

# Installation

- NPM: `npm i -D render-beforeall`<br/>
  YARN: `yarn add render-beforeall -D`
- Import this library into your test file<br/>
  ⚠️ Be sure to import this library Before importing `@testing-library/react`, this is a limitation of react testing library as described [here](https://testing-library.com/docs/react-testing-library/setup/#skipping-auto-cleanup:~:text=Just%20make%20sure%20you%20do%20this%20before%20importing%20%40testing%2Dlibrary/react)

## Jest

- Load it before all test using jest's [setupFilesAfterEnv](https://jestjs.io/docs/configuration#setupfilesafterenv-array) configuration.<br/>
  `jest.config.json`

  ```json
  {
    "setupFilesAfterEnv": ["render-beforeall"]
  }
  ```

- If you are using CRA you could import this in `setupTests.js` [check this explanation](https://create-react-app.dev/docs/running-tests/#initializing-test-environment)

## Mocha

By default this behaviour is not enabled in mocha, when using this library it will as this library takes control of when to cleanup and by default is afterEach test.
But if your suite happened to behave like this, is probably because someone configured it already following [this guide](https://testing-library.com/docs/react-testing-library/setup/#auto-cleanup-in-mochas-watch-mode)

so you will need to change:

```shell
mocha -r ./mocha-watch-cleanup-after-each.js
```

by

```shell
mocha -r render-beforeall
```

and that's it.

# How To Use it

```ts
import { renderBeforeAll } from "render-beforeall";
import { render, screen } from "@testing-library/react";
// import ...

describe("UserProfile", () => {
  renderBeforeAll(() => <UserProfile />); // <-- just this line

  it(`should let the user know about new offers`, () => {
    expect(screen.getByText("New offers!")).toBeInTheDocument();
  });

  it(`should present user's address`, () => {
    expect(screen.getByText("1772 Test Street")).toBeInTheDocument();
  });

  // ...
});
```

## Advanced use

Alternatively, you could control manually when the testing-library's `cleanup` function is called with the following example:

```ts
import { settings } from "render-beforeall";

settings.disableAutoCleanup();

// ... something

if (settings.isAutoCleanup()) {
  // do something when autoCleanup is on
}

settings.enableAutoCleanUp();
```

# Best Practices

## One State per describe

If your component has several states, avoid changing them as part of a test.<br/>
By not doing this [you might violate F.I.R.S.T.](#you-might-violate-first)

### BAD example

```ts

describe(`UserProfile`, () => {
  renderBeforeAll(() => <UserProfile />);

  test(`shows purchased products when unfolding purchases section`, ...);

  test(`shows a product`, ...);

  // more purchases section tests ...

  test(`shows invoices when unfolding invoces section`, ...);

  test(`shows an invoice`, ...);

  // more invoices section tests ...
});
```

### Good Example

```ts

describe(`UserProfile`, () => {
  describe(`Purchases`, () => {
    renderBeforeAll(() => <UserProfile />);
    beforeAll(() => userEvent.click(screen.getByText('Purchases')))

    test(`purchases section is shown`, ...);

    test(`shows a product`, ...);

    // more purchases section tests ...
  });

  describe(`Invoices`, () => {
    renderBeforeAll(() => <UserProfile />);
    beforeAll(() => userEvent.click(screen.getByText('Invoices')))

    test(`invoices section is shown`, ...);

    test(`shows an invoice`, ...);

    // more invoices section tests ...
  });
});
```

# Description, notes, motivations and alternatives

react-testing-library render beforeAll test utility

This tool was created to address the lack of subtests in jest and the enforced (and very useful) rule of react-testing-library to clean rendered components in `afterEach` [issue](https://github.com/testing-library/react-testing-library/issues/541). Allowing to render once and run several tests against the same rendered state, following [one test - one assertion](./one-test-one-assertion.md) principle.

**NOTE** This tool was not intended to improve performance and there are several caveats you need to take into account when using this tool.

## You might violate F.I.R.S.T.

**⚠️ WARNING ⚠️** You might violate [F.I.R.S.T.](https://medium.com/@tasdikrahman/f-i-r-s-t-principles-of-testing-1a497acda8d6), the I (Isolated/Independent part) as you render once, a test could change the state (i.e. interacting with the rendered component) and so the test running after that state change might need to know of that precondition.

An alternative to using this library is [Write fewer longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests).
Kent Dodds addresses the Isolation problem, and their's argument is that jest is good at pointing out what has failed in the test, which is true. Is my opinion that, jest's error messages are not good enough, I rather see the functional explanation of what got broken, rather than a `couldn't find an element with text ...` or couldn't find a button that should be expected (maybe because some business rule got broken and might not be that obvious).

Also when following TDD is way easier to follow [one test - one assertion](./one-test-one-assertion.md) is part of the discipline. It's easier to stop work at any moment when you have the test functional description described than the GOD test with several scenarios without any description. Also, way easier to read in a code review, and particularly easier to extract the test report and share it with team members to reduce duplication tests.

I strongly believe that Kent Dodds approach could be ok in small and/or fast projects (MVP) that are not intended to be refactored often or that might die quickly. But in a continuous delivery project, where refactors and new feature additions are high, better to go with [one test - one assertion](./one-test-one-assertion.md) principle for the reasons explained in that link.

## Conclusion

It will be a way better solution to have jest `subtests` similar to python's [unittest.subTest](https://docs.python.org/3/library/unittest.html#distinguishing-test-iterations-using-subtests) work

Rewriting Kent Dodds example:

```ts
test("course loads and renders the course information", async () => {
  const courseId = "123";
  const title = "My Awesome Course";
  const subtitle = "Learn super cool things";
  const topics = ["topic 1", "topic 2"];

  getCourseInfo.mockResolvedValueOnce(buildCourse({ title, subtitle, topics }));

  render(<Course courseId={courseId} />);

  subtest("should call the getCourseInfo function properly", () => {
    // danyg> please avoid contract tests you already testing this got properly called by asserting the side-effects of render
    expect(getCourseInfo).toHaveBeenCalledWith(courseId);
    expect(getCourseInfo).toHaveBeenCalledTimes(1);
  });

  subtest("should show a loading spinner", () => {
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/loading/i);
  });

  await subtest("should render the title", async () => {
    const titleEl = await screen.findByRole("heading");
    expect(titleEl).toHaveTextContent(title);
  });

  subtest("should render the subtitle", () => {
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  subtest("should render the list of topics", () => {
    const topicElsText = screen
      .getAllByRole("listitem")
      .map((el) => el.textContent);
    expect(topicElsText).toEqual(topics);
  });
});
```

This way FIRST wouldn't be broken and it will be easier to see what got broken and why.

# Examples

## Form

```ts
describe("RegisterForm", () => {
  describe("Shows the necessary fields", () => {
    renderBeforeAll(() => <RegisterForm />);

    it("shows a username input");

    it("shows a First Name input");

    it("shows a Last Name input");

    it("shows an Email input");

    it("shows an Repeat Email input");

    it("shows a Password input");

    it("shows a Repeat Password input");
  });

  describe("First Name Validations", () => {
    // these kind of test would change the state, do not use renderBeforeAll in this case FIRST could be violated
    it(`Shows an error First Name is empty`, () => {
      render(<RegisterForm />);
      // ...
    });

    it(`Shows an error First Name contain invalid characters`, () => {
      render(<RegisterForm />);
      // ...
    });

    // ...
  });

  // tho fields interacting, no need to use renderBeforeAll
  it(`Shows an error when Email and Repeat Email don't match`, () => {
    render(<RegisterForm />);
    // ...
  });

  it(`Shows an error when Password and Repeat Password don't match`, () => {
    render(<RegisterForm />);
    // ...
  });

  it(`Shows an error when First and Last Name conform an banned word or phrase`, () => {
    render(<RegisterForm />);
    // ...
  });
});
```

## Several States

```ts

describe(`UserProfile`, () => {
  describe(`Purchases`, () => {
    renderBeforeAll(() => <UserProfile />);
    beforeAll(() => userEvent.click(screen.getByText('Purchases')))

    test(`purchases section is shown`, ...);

    test(`shows a product`, ...);

    // more purchases section tests ...
  });

  describe(`Invoices`, () => {
    renderBeforeAll(() => <UserProfile />);
    beforeAll(() => userEvent.click(screen.getByText('Invoices')))

    test(`invoices section is shown`, ...);

    test(`shows an invoice`, ...);

    // more invoices section tests ...
  });
});
```
