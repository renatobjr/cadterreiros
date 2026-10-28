import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import client from "../../src/api/client";
import Mapping from "../../src/pages/Mapping";
import { sampleCommunities } from "../fixtures/communities";

vi.mock("../../src/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const getMock = client.get as unknown as ReturnType<typeof vi.fn>;

const envelope = (payload: unknown) => ({
  data: { status: true, data: payload },
});

describe("Mapping", () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockImplementation(() =>
      Promise.resolve(envelope(sampleCommunities)),
    );
  });

  it("renderiza 10 gráficos a partir da lista pública", async () => {
    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );
    expect(screen.getByText("4 terreiros")).toBeInTheDocument();
  });
});
