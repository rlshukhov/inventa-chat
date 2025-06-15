import type MarkdownIt from "markdown-it";

export default function hrefPlugin(md: MarkdownIt) {

    md.renderer.rules.link_open = (tokens, idx) => {
        if (!tokens[idx] || !tokens[idx].attrs) {
            return ''
        }

        const href = tokens[idx].attrs.find((attr) => attr[0] === 'href');
        if (!href) {
            return ''
        }

        return `<a href="${href[1]}" rel="noopener noreferrer" target="_blank" onclick="window.hrefClick(event)">`
    };
}