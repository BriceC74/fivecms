import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FiveMarkdowns, parseMarkdown } from "./ParseMarkdown";

type Content = {
	path: string;
	rawMarkdown: string;
	frontmatter?: matter.GrayMatterFile<string>;
	sections: FiveMarkdowns;
};

export class getContentsClass {
	private static readonly _CONTENT_PATH = path.join(import.meta.dirname, "..", "..", "data", "content");

	public static get CONTENT_PATH() {
		return getContentsClass._CONTENT_PATH;
	}

	/**
	 * Recursively gathers all `.md` files from the CONTENT directory
	 * and parses them into a structured content format suitable for GraphQL.
	 *
	 * @returns {Content[]} An array of content objects, each containing:
	 * - `path`: The file path relative to CONTENT_PATH.
	 * - `rawMarkdown`: The unprocessed Markdown content.
	 * - `frontmatter`: Parsed YAML frontmatter (if present), using `gray-matter`.
	 * - `sections`: Processed Markdown sections in a structured format (e.g., for rendering).
	 *
	 * @see {@link https://github.com/jonschlinkert/gray-matter gray-matter} for frontmatter parsing.
	 */
	static getContents(): Content[] {
		const files = fs.readdirSync(this.CONTENT_PATH, { recursive: true });

		const contents = [];
		for (const file of files) {
			if (typeof file !== "string") continue;
			if (!file.endsWith(".md")) continue;

			contents.push(this.getContent(file));
		}

		return contents;
	}

	/**
	 * Retrieves a content file and parses it into a GraphQL-ready format.
	 * Automatically resolves the path to `page.md` if not explicitly provided.
	 *
	 * Under the hood, it uses:
	 * - `gray-matter` for parsing YAML frontmatter
	 * - `unified` (`remarkParse`, `remarkStringify`) for processing Markdown
	 *
	 * @param filePath - The directory path where the `page.md` file is located.
	 *                   If a directory is given, it appends `/page.md` automatically.
	 * @returns {Content} The parsed content object with raw Markdown, frontmatter, and structured sections.
	 *
	 * @see {@link https://github.com/jonschlinkert/gray-matter gray-matter} for frontmatter parsing.
	 * @see {@link https://github.com/unifiedjs/unified unified} for Markdown processing.
	 */
	static getContent(filePath: string): Content {
		if (!filePath.endsWith("page.md") && !filePath.endsWith("/")) filePath += "/";
		if (!filePath.endsWith("page.md")) filePath += "page.md";

		const absoluteFilePath = path.join(this.CONTENT_PATH, filePath);

		const rawMarkdown = this.getMarkdown(absoluteFilePath);
		const frontmatter = matter(rawMarkdown);

		const sections = parseMarkdown(rawMarkdown);

		return { path: absoluteFilePath, rawMarkdown, frontmatter, sections };
	}

	/**
	 * Reads and returns the raw Markdown content from a file.
	 * Automatically appends `/page.md` to the path if not already specified.
	 *
	 * @param filePath - The path to the file or directory containing `page.md`.
	 *                   If a directory is provided, it resolves to `page.md` within that directory.
	 * @returns {string} The raw Markdown content as a UTF-8 string.
	 *
	 * @throws {Error} If the file does not exist or cannot be read.
	 */
	static getMarkdown(filePath: string): string {
		if (!filePath.endsWith("page.md") && !filePath.endsWith("/")) filePath += "/page.md";
		if (!filePath.endsWith("page.md")) filePath += "page.md";

		return fs.readFileSync(filePath, { encoding: "utf-8" });
	}
}

export const getContents = getContentsClass.getContents.bind(getContentsClass);
export const getContent = getContentsClass.getContent.bind(getContentsClass);
export const getMarkdown = getContentsClass.getMarkdown.bind(getContentsClass);
