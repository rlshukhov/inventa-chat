import type MarkdownIt from "markdown-it";

export default function copyButtonPlugin(md: MarkdownIt) {

    md.renderer.rules.fence = (tokens, idx, options) => {
        const token = tokens[idx];
        const code = token.content;
        const lang = token.info?.trim() || "";

        let highlighted = "";
        if (options.highlight) {
            highlighted = options.highlight(code, lang, "") || md.utils.escapeHtml(code);
        } else {
            highlighted = md.utils.escapeHtml(code);
        }

        const langClass = lang ? `language-${lang}` : "";

        let langText = `<p style="margin: 0">${lang}</p>`
        if (!lang) {
            langText = ''
        }

        return `
      <div class="code-container group relative">
        <button onclick="window.copyCodeButton(event)" class="copy-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-xs z-10 flex flex-row gap-2">
          ${langText}<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
        </button>
        <pre class="${langClass}"><code class="${langClass}">${highlighted}</code></pre>
      </div>
    `;
    };
}