import type { ReactNode } from "react";
import type { ArticleSection } from "../data";

const ALLOWED_INLINE_TAGS = new Set(["a", "b", "em", "i", "strong"]);

interface InlineElement {
  kind: "element";
  tag: string;
  attrs: string;
  children: InlineNode[];
}

type InlineNode = string | InlineElement;

/**
 * O conteúdo editorial vem do protótipo como HTML inline restrito a ênfase e
 * links. Em vez de injetar HTML cru, este parser monta nós React e ignora
 * qualquer tag fora da lista permitida.
 */
function parseInline(html: string): InlineNode[] {
  const root: InlineNode[] = [];
  const stack: InlineElement[] = [];
  let current = root;
  let cursor = 0;
  const tagPattern = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    const text = html.slice(cursor, match.index);
    if (text) current.push(text);
    cursor = tagPattern.lastIndex;

    const tag = match[2].toLowerCase();
    if (!ALLOWED_INLINE_TAGS.has(tag)) continue;

    if (match[1] === "") {
      const node: InlineElement = {
        kind: "element",
        tag,
        attrs: match[3],
        children: [],
      };
      current.push(node);
      stack.push(node);
      current = node.children;
    } else {
      const openIndex = stack.map((node) => node.tag).lastIndexOf(tag);
      if (openIndex === -1) continue;
      stack.length = openIndex;
      current = stack.length > 0 ? stack[stack.length - 1].children : root;
    }
  }

  const tail = html.slice(cursor);
  if (tail) current.push(tail);
  return root;
}

function renderInline(nodes: InlineNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    if (typeof node === "string") return node;

    const key = `${keyPrefix}-${index}`;
    const children = renderInline(node.children, key);

    if (node.tag === "b" || node.tag === "strong") {
      return <strong key={key}>{children}</strong>;
    }
    if (node.tag === "i" || node.tag === "em") {
      return <em key={key}>{children}</em>;
    }
    if (node.tag === "a") {
      const href = /href="([^"]*)"/i.exec(node.attrs)?.[1];
      if (!href || !/^https?:\/\//i.test(href)) {
        return <span key={key}>{children}</span>;
      }
      return (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return <span key={key}>{children}</span>;
  });
}

export interface ArticleBodyProps {
  sections: ArticleSection[];
  references: string[];
}

/** Corpo do artigo: seções numeradas (para o sumário), blocos e referências. */
export function ArticleBody({ sections, references }: ArticleBodyProps) {
  return (
    <>
      {sections.map((section, sectionIndex) => {
        const sectionId = `secao-${sectionIndex + 1}`;

        return (
          <section key={section.title}>
            <h2 className="display-3" id={sectionId} tabIndex={-1}>
              {section.title}
            </h2>
            {section.blocks.map((block, blockIndex) => {
              const key = `${sectionId}-${blockIndex}`;

              if (block.type === "p") {
                return <p key={key}>{renderInline(parseInline(block.html), key)}</p>;
              }

              if (block.type === "h3") {
                // O protótipo usa esse subtítulo como marcador do fim do
                // corpo; a seção de referências logo abaixo já cumpre o papel.
                if (/^referências/i.test(block.text)) return null;
                return <h3 key={key}>{block.text}</h3>;
              }

              const List = block.type;
              return (
                <List key={key}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`${key}-${itemIndex}`}>
                      {renderInline(parseInline(item), `${key}-${itemIndex}`)}
                    </li>
                  ))}
                </List>
              );
            })}
          </section>
        );
      })}

      {references.length > 0 ? (
        <section className="references">
          <h2 className="display-3">Referências</h2>
          <ol>
            {references.map((reference, index) => (
              <li key={`referencia-${index}`}>
                {renderInline(parseInline(reference), `referencia-${index}`)}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}

export default ArticleBody;
