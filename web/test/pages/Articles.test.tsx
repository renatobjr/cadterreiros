import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Articles from "../../src/pages/Articles";
import { ARTICLES } from "../../src/features/articles/data";

const renderArticles = () =>
  render(
    <MemoryRouter>
      <Articles />
    </MemoryRouter>,
  );

describe("Articles", () => {
  it("renderiza o cabeçalho da listagem", () => {
    renderArticles();

    expect(
      screen.getByRole("heading", { level: 1, name: "Artigos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Textos de apoio para entender as comunidades tradicionais/),
    ).toBeInTheDocument();
  });

  it("lista os três artigos com link para cada slug", () => {
    renderArticles();

    const grid = document.querySelector(".articles-grid") as HTMLElement;
    expect(grid).not.toBeNull();
    expect(within(grid).getAllByRole("link")).toHaveLength(3);

    const expected = [
      {
        slug: "comunidades-tradicionais",
        title: "O que são Comunidades Tradicionais?",
      },
      {
        slug: "linguas-do-candomble",
        title: "Quais as linguagens do Candomblé?",
      },
      {
        slug: "nacoes-do-candomble",
        title: "Quais as nações do Candomblé no Brasil?",
      },
    ];

    for (const article of expected) {
      expect(
        within(grid).getByRole("link", { name: new RegExp(article.title) }),
      ).toHaveAttribute("href", `/artigos/${article.slug}`);
    }
    expect(within(grid).getAllByText(/Ler artigo/)).toHaveLength(3);
  });

  it("exibe kicker e descrição de cada artigo", () => {
    renderArticles();

    for (const article of ARTICLES) {
      expect(screen.getByText(article.kicker)).toBeInTheDocument();
      expect(screen.getByText(article.description)).toBeInTheDocument();
    }
  });

  it("mostra a imagem de cada card", () => {
    renderArticles();

    const images = document.querySelectorAll(".article-card__img");
    expect(images).toHaveLength(3);
    images.forEach((image) => {
      expect(image).toHaveAttribute("alt", "");
      expect(image.getAttribute("src")).toContain("artigo-");
    });
  });
});
