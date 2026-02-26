import fs from "node:fs";
import path from "node:path";

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
			contents.push({ path: file, markdown: getMarkdown(file) });
		}
	}

	return contents;
};

export default getContents;

const getMarkdown = (file: string): string => {
	return fs.readFileSync(path.join(CONTENT_PATH, file), { encoding: "utf-8" });
};
