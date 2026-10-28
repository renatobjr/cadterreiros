import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Article from "../../src/pages/Article";
import { getArticle } from "../../src/features/articles/data";

const renderArticle = (slug: string) =>
  render(
    <MemoryRouter initialEntries={[`/artigos/${slug}`]}>
      <Routes>
        <Route path="/artigos/:slug" element={<Article />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Article", () => {
  it("renderiza título, kicker, descrição e imagem do artigo", () => {
    const article = getArticle("comunidades-tradicionais");
    const { container } = renderArticle("comunidades-tradicionais");

    expect(article).toBeDefined();
    expect(
      screen.getByRole("heading", { level: 1, name: article!.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Artigo · ${article!.kicker}`),
    ).toBeInTheDocument();
    expect(screen.getByText(article!.description)).toBeInTheDocument();

    const hero = container.querySelector(".article-hero");
    expect(hero).not.toBeNull();
    expect(hero?.getAttribute("src")).toContain("artigo-comunidades");
    expect(hero).toHaveAttribute("alt", "");
  });

  it("renderiza a trilha, o destaque e o tempo de leitura", () => {
    renderArticle("comunidades-tradicionais");

    const crumbs = screen.getByRole("navigation", {
      name: "Trilha de navegação",
    });
    expect(within(crumbs).getByRole("link", { name: "Artigos" })).toHaveAttribute(
      "href",
      "/artigos",
    );
    expect(within(crumbs).getByText("O que são Comunidades Tradicionais?")).toBeInTheDocument();

    expect(screen.getByText("Diversidade Religiosa")).toBeInTheDocument();
    expect(
      screen.getByText(/^O Brasil é um país tecido por uma diversidade cultural imensa/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Leitura de \d+ min/)).toBeInTheDocument();
  });

  it("renderiza as seções na ordem e o sumário com âncoras", () => {
    const article = getArticle("comunidades-tradicionais")!;
    const { container } = renderArticle("comunidades-tradicionais");

    const sectionHeadings = Array.from(
      container.querySelectorAll(".article section h2"),
    ).map((heading) => heading.textContent);
    expect(sectionHeadings.slice(0, article.sections.length)).toEqual(
      article.sections.map((section) => section.title),
    );

    const toc = container.querySelector(".toc") as HTMLElement;
    expect(toc).not.toBeNull();
    const tocLinks = within(toc).getAllByRole("link");
    expect(tocLinks).toHaveLength(article.sections.length);
    expect(tocLinks[0]).toHaveAttribute("href", "#secao-1");
  });

  it("renderiza os parágrafos e as referências com ênfase e link externo", () => {
    renderArticle("comunidades-tradicionais");

    expect(
      screen.getByText(/Quando falamos em "Povos e Comunidades Tradicionais de Matriz Africana"/),
    ).toBeInTheDocument();

    const references = document.querySelector(".references") as HTMLElement;
    expect(references).not.toBeNull();
    expect(
      within(references).getByRole("heading", { name: "Referências" }),
    ).toBeInTheDocument();
    expect(within(references).getAllByRole("listitem")).toHaveLength(4);

    const emphasis = within(references).getByText(
      "Civitas - Revista de Ciências Sociais",
    );
    expect(emphasis.tagName).toBe("EM");

    const externalLink = within(references).getAllByRole("link")[0];
    expect(externalLink).toHaveAttribute(
      "href",
      "https://www.scielo.br/j/civitas/a/RjnJ89KdHyv6b4jyd4YfcMG/",
    );
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renderiza subtítulos h3 nos artigos que os possuem", () => {
    const { container } = renderArticle("nacoes-do-candomble");

    const firstSection = container
      .querySelector("#secao-1")
      ?.closest("section") as HTMLElement;
    expect(firstSection).not.toBeNull();
    expect(
      within(firstSection).getByRole("heading", {
        level: 3,
        name: "História no Brasil",
      }),
    ).toBeInTheDocument();

    const references = document.querySelector(".references") as HTMLElement;
    expect(
      within(references).getAllByRole("listitem"),
    ).toHaveLength(getArticle("nacoes-do-candomble")!.references.length);
  });

  it("mostra 404 quando o slug não existe", () => {
    const { container } = renderArticle("artigo-inexistente");

    expect(
      screen.getByRole("heading", { level: 1, name: "Artigo não encontrado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ver todos os artigos/ }),
    ).toHaveAttribute("href", "/artigos");
    expect(container.querySelector(".article-hero")).toBeNull();
    expect(container.querySelector(".article")).toBeNull();
  });
});
