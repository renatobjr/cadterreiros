/**
 * Copia texto para a área de transferência.
 *
 * A Clipboard API só existe em contexto seguro e pode ser bloqueada por
 * permissão/política do navegador — nesses casos caímos para o `textarea`
 * + `document.execCommand("copy")`, que funciona no contexto atual.
 * Retorna `false` quando as duas estratégias falham.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // segue para o fallback (permissão negada, documento sem foco etc.)
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(area);
    return copied;
  } catch {
    return false;
  }
}

export default copyToClipboard;
