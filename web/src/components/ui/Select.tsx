import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Select acessível com lista própria.
 *
 * O `<select>` nativo é desenhado pelo sistema operacional: o realce de hover
 * ignora o CSS e aparece em azul do tema. Para usar a paleta do projeto, a
 * lista é renderizada em HTML com `role="listbox"`, mantendo teclado
 * (setas, Home/End, Enter e Esc), `aria-*` e o fechamento por clique fora.
 */
export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  invalid,
  describedBy,
}: SelectProps) {
  const listboxId = `${id}-listbox`;
  const reactId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

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

  function openList() {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          if (activeIndex >= 0) choose(options[activeIndex]);
          return;
        }
        setActiveIndex((current) => {
          const next =
            event.key === "ArrowDown" ? current + 1 : current - 1;
          return Math.min(Math.max(next, 0), options.length - 1);
        });
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className="cselect" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        className={`select cselect__button${selected ? "" : " is-placeholder"}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
        }
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleButtonKeyDown}
      >
        <span className="cselect__value">{selected?.label ?? placeholder}</span>
      </button>

      {open ? (
        <ul className="cselect__list" id={listboxId} role="listbox">
          {options.map((option, index) => (
            <li
              key={`${reactId}-${option.value}`}
              id={`${id}-opt-${index}`}
              role="option"
              data-value={option.value}
              aria-selected={option.value === value}
              className={`cselect__option${
                index === activeIndex ? " is-active" : ""
              }`}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Select;
