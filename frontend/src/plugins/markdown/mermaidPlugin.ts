import type MarkdownIt from 'markdown-it';

export default function mermaidPlugin(md: MarkdownIt) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const defaultRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, renderer) {
        return renderer.renderToken(tokens, idx, options);
    };

    md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
        const token = tokens[idx];
        const info = token.info ? token.info.trim() : '';

        if (info === 'mermaid') {
            const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            return `<div class="mermaid-placeholder" 
                   data-diagram="${encodeURIComponent(token.content)}"
                   data-id="${id}"><p>Loading</p></div>`;
        }

        return defaultRenderer(tokens, idx, options, env, renderer);
    };
}
