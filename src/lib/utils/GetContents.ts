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

	static getContent(filePath: string): Content {
		if (!filePath.endsWith("page.md") && !filePath.endsWith("/")) filePath += "/";
		if (!filePath.endsWith("page.md")) filePath += "page.md";

		const absoluteFilePath = path.join(this.CONTENT_PATH, filePath);

		const rawMarkdown = this.getMarkdown(absoluteFilePath);
		const frontmatter = matter(rawMarkdown);

		const sections = parseMarkdown(rawMarkdown);

		return { path: absoluteFilePath, rawMarkdown, frontmatter, sections };
	}

	static getMarkdown(filePath: string): string {
		if (!filePath.endsWith("page.md") && !filePath.endsWith("/")) filePath += "/page.md";
		if (!filePath.endsWith("page.md")) filePath += "page.md";

		return fs.readFileSync(filePath, { encoding: "utf-8" });
	}
}

export const getContents = getContentsClass.getContents.bind(getContentsClass);
export const getContent = getContentsClass.getContent.bind(getContentsClass);
export const getMarkdown = getContentsClass.getMarkdown.bind(getContentsClass);
