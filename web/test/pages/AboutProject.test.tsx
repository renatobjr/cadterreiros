import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import AboutProject from "../../src/pages/AboutProject";
import { ABOUT_PROJECT } from "../../src/features/about/data";

const renderPage = () =>
  render(
    <MemoryRouter>
      <AboutProject />
    </MemoryRouter>,
  );

describe("AboutProject", () => {
  it("renderiza o cabeçalho profundo com kicker, título, descrição e meta", () => {
    const { container } = renderPage();
    const head = container.querySelector(".page-head--deep");

    expect(head).not.toBeNull();
    expect(
      within(head as HTMLElement).getByText(ABOUT_PROJECT.kicker),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: ABOUT_PROJECT.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(ABOUT_PROJECT.description)).toBeInTheDocument();

    const meta = head?.querySelector(".page-head__meta") as HTMLElement;
    expect(meta).not.toBeNull();
    expect(within(meta).getAllByText(/./)).toHaveLength(3);
    expect(within(meta).getByText("Processo Seletivo nº 01/2018")).toBeInTheDocument();
    expect(within(meta).getByText("Projeto BRA/15/010")).toBeInTheDocument();
    expect(
      within(meta).getByText("Casa de Cultura Ilê Asé D'Osoguian"),
    ).toBeInTheDocument();
  });

  it("renderiza o destaque da entidade executora e a imagem de capa", () => {
    const { container } = renderPage();
    const notice = container.querySelector(".article .notice") as HTMLElement;

    expect(notice).not.toBeNull();
    expect(within(notice).getByText(ABOUT_PROJECT.leadTitle)).toHaveClass(
      "notice__title",
    );
    expect(within(notice).getByText(ABOUT_PROJECT.lead)).toBeInTheDocument();

    const hero = container.querySelector(".article .article-hero");
    expect(hero).not.toBeNull();
    expect(hero?.getAttribute("src")).toContain("sobre");
    expect(hero).toHaveAttribute("alt", "");
    expect(hero).toHaveAttribute("width", "768");
    expect(hero).toHaveAttribute("height", "480");
    expect(hero).toHaveAttribute("loading", "lazy");
  });

  it("renderiza as seções na ordem, com âncoras e listas", () => {
    const { container } = renderPage();

    const sectionHeadings = Array.from(
      container.querySelectorAll(".article > section:not(.references) > h2"),
    ).map((heading) => heading.textContent);
    expect(sectionHeadings).toEqual(
      ABOUT_PROJECT.sections.map((section) => section.title),
    );

    ABOUT_PROJECT.sections.forEach((section, index) => {
      const heading = container.querySelector(`#secao-${index + 1}`);
      expect(heading).not.toBeNull();
      expect(heading?.textContent).toBe(section.title);
      expect(heading).toHaveClass("display-3");
      expect(heading).toHaveAttribute("tabindex", "-1");
    });

    const objetivos = container
      .querySelector("#secao-2")
      ?.closest("section") as HTMLElement;
    expect(within(objetivos).getAllByRole("listitem")).toHaveLength(6);
    expect(within(objetivos).getByText("Conferir Visibilidade:").tagName).toBe(
      "STRONG",
    );

    const importancia = container
      .querySelector("#secao-3")
      ?.closest("section") as HTMLElement;
    expect(within(importancia).getByRole("list")).toBeInTheDocument();
    expect(within(importancia).getAllByRole("listitem")).toHaveLength(5);
    // O marcador "Referências:" do protótipo é absorvido pela seção de
    // referências, que aparece uma única vez com o título no plural.
    expect(
      within(importancia).queryByRole("heading", { level: 3 }),
    ).toBeNull();
  });

  it("renderiza as referências do projeto", () => {
    const { container } = renderPage();
    const references = container.querySelector(".references") as HTMLElement;

    expect(references).not.toBeNull();
    expect(
      within(references).getByRole("heading", { name: "Referências" }),
    ).toBeInTheDocument();
    expect(within(references).getAllByRole("listitem")).toHaveLength(
      ABOUT_PROJECT.references.length,
    );
    expect(
      within(references).getByText(ABOUT_PROJECT.references[0]),
    ).toBeInTheDocument();
  });

  it("renderiza o sumário 'Nesta página' com link para cada seção", () => {
    const { container } = renderPage();
    const toc = container.querySelector(".toc") as HTMLElement;

    expect(toc).not.toBeNull();
    expect(
      within(toc).getByRole("heading", { name: "Nesta página" }),
    ).toBeInTheDocument();

    const links = within(toc).getAllByRole("link");
    expect(links).toHaveLength(ABOUT_PROJECT.sections.length);
    links.forEach((link, index) => {
      expect(link).toHaveAttribute("href", `#secao-${index + 1}`);
      expect(link.textContent).toBe(ABOUT_PROJECT.sections[index].title);
    });
  });

  it("oferece os CTAs finais para o acervo e os artigos", () => {
    renderPage();

    expect(
      screen.getByRole("link", { name: /Explorar o acervo/ }),
    ).toHaveAttribute("href", "/buscar");
    expect(
      screen.getByRole("link", { name: "Ler os artigos" }),
    ).toHaveAttribute("href", "/artigos");
  });
});
