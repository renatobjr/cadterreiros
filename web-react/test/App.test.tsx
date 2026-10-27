import { render } from "@testing-library/react";
import App from "../src/App";

test("renders App", () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});