import { beforeEach, describe, expect, it, vi } from "vitest";

const http = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../src/api/client", () => ({ default: http }));

import {
  addUser,
  assignOwner,
  changeUserRole,
  setUserStatus,
  uploadMainPicture,
} from "../../src/api/admin";

const OK = { data: { status: true, data: true } };

beforeEach(() => {
  http.get.mockReset();
  http.put.mockReset();
  http.post.mockReset();
  http.get.mockResolvedValue(OK);
  http.put.mockResolvedValue(OK);
  http.post.mockResolvedValue(OK);
});

describe("contrato do cliente administrativo", () => {
  it("desativa usuário com { id, status }", async () => {
    await setUserStatus("u1", false);

    expect(http.put).toHaveBeenCalledWith("users/set-user-status", {
      id: "u1",
      status: false,
    });
  });

  it("troca papel com { id, role }", async () => {
    await changeUserRole("u1", "census_taker");

    expect(http.put).toHaveBeenCalledWith("users/change-user-role", {
      id: "u1",
      role: "census_taker",
    });
  });

  it("envia nome, e-mail e papel no convite", async () => {
    await addUser({
      fullname: "Nova Pessoa",
      email: "nova@cciao.org",
      role: "census_taker",
    });

    expect(http.post).toHaveBeenCalledWith("users/add-user", {
      fullname: "Nova Pessoa",
      email: "nova@cciao.org",
      role: "census_taker",
    });
  });

  it("atribui recenseador com o payload da API", async () => {
    await assignOwner("c1", "u2", true);

    expect(http.put).toHaveBeenCalledWith("religious-communities/assign-owner", {
      communityId: "c1",
      userId: "u2",
      keepStatus: true,
    });
  });

  it("sobe a foto como multipart no campo `file`", async () => {
    const file = new File(["foto"], "fachada.png", { type: "image/png" });

    await uploadMainPicture("c1", file);

    const [url, body] = http.post.mock.calls[0];
    expect(url).toBe("religious-communities/upload-main-picture/c1");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
  });
});
