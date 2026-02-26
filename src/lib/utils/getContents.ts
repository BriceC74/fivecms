import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

type Content = {
	path: string;
	markdown: string;
	frontmatter?: JSON;
};

const CONTENT_PATH = path.join(import.meta.dirname, "..", "..", "data", "content");

const getContents = (): Content[] => {
	const files = fs.readdirSync(CONTENT_PATH, { recursive: true });

	const contents = [];
	for (const file of files) {
		if (typeof file !== "string") continue;

		if (file.endsWith(".md")) {
			const filePath = path.join(CONTENT_PATH, file);

			const rawMarkdown = getMarkdown(filePath);
			const frontmatter = matter(rawMarkdown);
			contents.push({ path: file, rawMarkdown, frontmatter });
		}
	}

	return contents;
};

export default getContents;

const getMarkdown = (filePath: string): string => {
	return fs.readFileSync(filePath, { encoding: "utf-8" });
};
