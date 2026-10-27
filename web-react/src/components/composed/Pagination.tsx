import Button from "../ui/Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), safeTotal);

  const classes = ["pager", className].filter(Boolean).join(" ");

  const go = (next: number) => {
    if (next < 1 || next > safeTotal || next === current) return;
    onChange(next);
  };

  const pageNumbers: number[] = [];
  for (let i = 1; i <= safeTotal; i++) pageNumbers.push(i);

  return (
    <nav className={classes} aria-label="Paginação">
      <div className="pager__btns">
        <Button
          className="pager__btn"
          variant="ghost"
          disabled={current <= 1}
          onClick={() => go(current - 1)}
          aria-label="Página anterior"
        >
          Anterior
        </Button>
        {pageNumbers.map((n) => (
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
          aria-label="Próxima página"
        >
          Próxima
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;