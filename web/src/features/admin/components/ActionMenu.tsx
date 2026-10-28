import { useCallback, useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import type { AdminActionKind } from "./AdminActionIcon";
import AdminActionIcon from "./AdminActionIcon";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: AdminActionKind;
  danger?: boolean;
  onSelect: () => void;
}

export interface ActionMenuProps {
  /** Nome do grupo, usado no rótulo acessível do gatilho. */
  label: string;
  items: ActionMenuItem[];
}

/**
 * Menu de ações secundárias (mock: botão “⋮” + “Mais ações”).
 *
 * Segue o padrão WAI-ARIA de menu: `aria-haspopup="menu"`, `role="menu"`,
 * navegação por setas/Home/End, Enter/Espaço para acionar, Esc para fechar
 * devolvendo o foco ao gatilho e clique fora para dispensar.
 */
export function ActionMenu({ label, items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  function openMenu(index = 0) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(item: ActionMenuItem) {
    close();
    item.onSelect();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(items.length - 1);
    }
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % items.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + items.length) % items.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="action-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        className="btn btn--ghost action-menu__trigger"
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openMenu(0))}
        onKeyDown={handleTriggerKeyDown}
      >
        <EllipsisVertical size={18} strokeWidth={1.9} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="action-menu__list"
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={`action-menu__item${item.danger ? " is-danger" : ""}`}
              onClick={() => choose(item)}
            >
              {item.icon ? <AdminActionIcon kind={item.icon} /> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ActionMenu;
