# One Test - One Assertion

What one test - one assertion means is that you should create a test enunciate that define one functional assertion, and that that shall only ensure that.

**It never was intended to mean that only one assert command has to be executed.**<br/>

The goal is to have quick feedback about what has been broken when the code is being refactored in the future.<br/>
You'd want instant feedback about what functionally got broken by a refactor so you can fix it, quickly without even needing to read the test details, only the test description.<br/>
This is based on the fast feedback loop required in an efficient TDD practice.

## Examples

### Data Objects

#### Bad Example

```ts
  it(`should provide user's details`, () => {
    const userDetails = getUserDetails(user);

    expect(userDetails).toMatchObject({
      address: '1772 Test Street, 88888 New York City, NY',
      phone: '(302)555-7357';
      email: 'test-user@test-server.com'
    });
  });
```

#### Good example

```ts
it(`should provide user's address`, () => {
  const userDetails = getUserDetails(user);

  expect(userDetails.address).toEqual(
    "1772 Test Street, 88888 New York City, NY"
  );
});

it(`should provide user's phone`, () => {
  const userDetails = getUserDetails(user);

  expect(userDetails.address).toEqual("(302)555-7357");
});

it(`should provide user's email`, () => {
  const userDetails = getUserDetails(user);

  expect(userDetails.address).toEqual("test-user@test-server.com");
});
```

**Reasoning**: several implementations could achieve this result, getting data directly from a backend and some sanitizer between, a bunch of selectors working together to build the userDetails object, a list of configurable providers that do that, etc...

Now let's imagine in the future you need to add a new field. Both options will continue asserting that the current functionality is provided, and won't fail by adding a new field (`toMatchObject` disregards extra fields). But let's imagine that by doing the refactor you need to change where some of the fields come from, and the phone, in particular, got broken as part of the refactor.<br/>
Would you rather see user details in their entirety broken and start debugging and checking what exactly got broken, or you rather know straight away that what's broken was the phone field?

Now imagine this in bigger data sets or nested ones.

### Several Asserts commands could be one assert

```ts
it("should let the user know about new offers", () => {
  render(<UserProfile />);

  expect(screen.getByText("New offers!")).toBeInTheDocument();
  expect(screen.getByText("Test Offer 1")).toBeInTheDocument();
  expect(screen.getByText("Test Offer 2")).toBeInTheDocument();
});
```

### Using `render-beforeall`

```ts
describe("UserProfile", () => {
  renderBeforeAll(() => <UserProfile />);

  it(`should let the user know about new offers`, () => {
    expect(screen.getByText("New offers!")).toBeInTheDocument();
    expect(screen.getByText("Test Offer 1")).toBeInTheDocument();
    expect(screen.getByText("Test Offer 2")).toBeInTheDocument();
  });

  it(`should present user's address`, () => {
    const addressGroup = screen.getByTestid("user-address");
    expect(getByText(addressGroup, "Address:")).toBeInTheDocument();
    expect(
      getByText(addressGroup, "1772 Test Street, 88888 New York City, NY")
    ).toBeInTheDocument();
  });

  it(`should present user's email`, () => {
    const phoneGroup = screen.getByTestid("phone-email");
    expect(getByText(phoneGroup, "Phone:")).toBeInTheDocument();
    expect(getByText(phoneGroup, "(333)555-7357")).toBeInTheDocument();
  });

  it(`should present user's email`, () => {
    const phoneGroup = screen.getByTestid("phone-email");
    expect(getByText(phoneGroup, "Phone:")).toBeInTheDocument();
    expect(getByText(phoneGroup, "(333)555-7357")).toBeInTheDocument();
  });
});
```
