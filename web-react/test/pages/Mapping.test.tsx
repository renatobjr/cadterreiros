import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import client from "../../src/api/client";
import Mapping from "../../src/pages/Mapping";

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

const payloads: Record<string, unknown> = {
  summary: {
    totalReligiousCommunities: 1,
    totalCities: 1,
    totalNeighborhoods: 1,
  },
  "by-nation": [{ nation: "ketu", count: 1 }],
  "by-city": [{ city: "João Pessoa", count: 1 }],
  "by-decade": [{ decade: "1990s", count: 1 }],
  "by-type-and-nation": [{ nation: "ketu", african: 1, traditional: 0 }],
  "by-type": [{ type: "matriz africana", count: 1 }],
  "by-leader-gender": [],
  "by-leader-ethnicity": [],
  "by-language": [],
  "by-neighborhood": [{ neighborhood: "Centro", count: 1 }],
  "photo-coverage": { withPhoto: 1, withoutPhoto: 0, total: 1 },
};

describe("Mapping", () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockImplementation((url: string) =>
      Promise.resolve(envelope(payloads[url.split("/").pop() ?? ""])),
    );
  });

  it("renderiza 10 gráficos a partir da API", async () => {
    render(<Mapping />);

    await waitFor(() =>
      expect(screen.getAllByTestId("chart-card")).toHaveLength(10),
    );
  });
});
