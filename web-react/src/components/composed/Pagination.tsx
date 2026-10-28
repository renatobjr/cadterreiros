import Button from "../ui/Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Janela de até cinco páginas em torno da atual (mock: `pageWindow`). */
function pageWindow(page: number, pages: number): number[] {
  let start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  start = Math.max(1, end - 4);

  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * Paginação compartilhada entre a área pública (busca) e o painel.
 * Mostra "Página X de Y" e uma janela de cinco números.
 */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), safeTotal);

  const classes = ["pager", className].filter(Boolean).join(" ");

  const go = (next: number) => {
    if (next < 1 || next > safeTotal || next === current) return;
    onChange(next);
  };

  return (
    <nav className={classes} aria-label="Paginação">
      <p className="meta">
        Página {current} de {safeTotal}
      </p>
      <div className="pager__btns">
        <Button
          className="pager__btn"
          variant="ghost"
          disabled={current <= 1}
          onClick={() => go(current - 1)}
        >
          Anterior
        </Button>
        {pageWindow(current, safeTotal).map((n) => (
          <Button
            key={n}
            className="pager__btn"
            variant={n === current ? "primary" : "ghost"}
            aria-current={n === current ? "page" : undefined}
            onClick={() => go(n)}
          >
            {n}
          </Button>
        ))}
        <Button
          className="pager__btn"
          variant="ghost"
          disabled={current >= safeTotal}
          onClick={() => go(current + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
