function useMutableWindow() {
  const { location } = window;
  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    window.location = { ...location };
  });

  afterAll(() => {
    window.location = location;
  });
}

export default useMutableWindow;
