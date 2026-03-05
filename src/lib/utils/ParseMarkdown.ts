import remarkParse from "remark-parse";
import { unified } from "unified";
import { Root, RootContent } from "mdast";
import remarkStringify from "remark-stringify";

export type FiveMarkdowns = FiveMarkdown[];

export type FiveMarkdown = {
	ComponentName: string;
	rawSection: string;
	elements: FiveSection;
	children?: FiveMarkdowns;
};

export type FiveSection = FiveElement[];

export type FiveElement =
	| {
			heading: FiveHeading;
	  }
	| {
			paragraph: string;
	  };

export type FiveHeading = {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	text: string;
};

export class ParseMarkdown {
	/**
	 * Parses a Markdown string into a structured AST using remark-parse.
	 *
	 * @param {string} md - The raw Markdown content to parse.
	 * @returns {FiveMarkdowns} An array of processed content sections, each representing
	 *   a component block defined by `--"ComponentName` and `"--` markers.
	 */
	static parseMarkdown(md: string): FiveMarkdowns {
		const rawSection: Root = unified().use(remarkParse).parse(md);

		const parsedMarkdown: FiveMarkdowns = this.getSections(rawSection.children);

		return parsedMarkdown;
	}

	/**
	 * Splits the MDAST into multiple sections by repeatedly extracting content
	 * between component markers (`--"ComponentName` and `"--`).
	 *
	 * Each section is parsed into a `FiveMarkdown` object and collected into an array.
	 *
	 * @param {RootContent[]} mdast - The array of MDAST nodes to process.
	 * @returns {FiveMarkdowns} An array of parsed component sections.
	 */
	static getSections(mdast: RootContent[]): FiveMarkdowns {
		const sections: FiveMarkdowns = [];

		while (mdast.length > 1) {
			const { endIndex, section } = this.getSection(mdast);
			sections.push(section);
			mdast.splice(0, endIndex);
		}

		return sections;
	}

	/**
	 * Extracts a single content section from the MDAST by locating the first component marker.
	 * Parses the section into a structured `FiveMarkdown` object and returns it with its end index.
	 *
	 * @param {RootContent[]} mdast - The array of MDAST nodes to process.
	 * @returns {{ endIndex: number; section: FiveMarkdown }} An object containing:
	 *   - `endIndex`: The index where the section ends (used for slicing).
	 *   - `section`: The transformed `FiveMarkdown` object with component name, content elements, and nested children.
	 */
	static getSection(mdast: RootContent[]): { endIndex: number; section: FiveMarkdown } {
		let startIndex = this.findStartIndex(mdast);
		let endIndex = this.findEndIndex({ mdast, startIndex });

		const mdastSection = mdast.slice(startIndex, endIndex);
		const transformedSection = this.transformSection(mdastSection);

		return { endIndex, section: transformedSection };
	}

	/**
	 * Finds the index where a section begins, marked by a paragraph starting with `--"`.
	 * Used to delimit the start of a component section in the Markdown AST.
	 *
	 * @param {RootContent[]} mdast - The array of MDAST nodes being processed.
	 * @returns {number} The index of the starting marker, or 0 if not found.
	 */
	static findStartIndex(mdast: RootContent[]): number {
		let index = 0;
		for (let i = 0; i < mdast.length; i++) {
			const node = mdast[i];

			if (node.type !== "paragraph") continue;
			if (node.children[0].type !== "text") continue;
			if (!node.children[0].value.startsWith(`--"`)) continue;

			index = i;
			break;
		}

		return index;
	}

	/**
	 * Finds the index where a section ends, marked by a paragraph starting with `"--`.
	 * Used to delimit the end of a component section in the Markdown AST.
	 *
	 * @param {Object} params - The input parameters.
	 * @param {RootContent[]} params.mdast - The array of MDAST nodes being processed.
	 * @param {number} params.startIndex - The starting index to begin searching from.
	 * @returns {number} The index of the ending marker, or the end of the array if not found.
	 */
	static findEndIndex({ mdast, startIndex }: { mdast: RootContent[]; startIndex: number }): number {
		let index = mdast.length;
		for (let i = startIndex; i < mdast.length; i++) {
			const node = mdast[i];

			if (node.type !== "paragraph") continue;
			if (node.children[0].type !== "text") continue;
			if (!node.children[0].value.startsWith(`"--`)) continue;

			index = i;
			break;
		}
		return index;
	}

	/**
	 * Transforms a portion of MDAST (Markdown Abstract Syntax Tree) into a `FiveMarkdown` object.
	 *
	 * This method processes nodes to extract content, identifies component boundaries
	 * using special markers (`--"ComponentName` and `"--`), and handles nested components.
	 *
	 * @param mdast - The array of MDAST nodes to transform.
	 * @param isChildren - Indicates whether this section is a nested child component.
	 *                     Affects how nested components and end markers are handled.
	 * @returns {FiveMarkdown} The transformed section, including:
	 *   - `ComponentName`: Derived from `--"ComponentName` marker, defaults to "GenericComponent".
	 *   - `rawSection`: The reprocessed Markdown string of the section.
	 *   - `elements`: Array of parsed content.
	 *   - `children`: Nested components (if any).
	 */
	static transformSection(mdast: RootContent[], isChildren?: boolean): FiveMarkdown {
		let ComponentName = "GenericComponent";

		const elements: FiveSection = [];
		const children: FiveMarkdowns = [];

		let endIndex = mdast.length;
		for (let i = 0; i < mdast.length; i++) {
			const node = mdast[i];

			if (node.type === "thematicBreak") {
				if (!isChildren) {
					const slicedMdast = mdast.slice(i + 1);
					const nestedSection = this.transformSection(slicedMdast, true);
					children.push(nestedSection);
					i += nestedSection.elements.length;
					continue;
				}

				endIndex = i;
				break;
			}

			if (node.type === "heading" && !!node.children[0]) {
				const child = node.children[0];

				if (child.type === "text") {
					elements.push({
						heading: {
							level: node.depth,
							text: child.value,
						},
					});
				}
			}

			if (node.type === "paragraph" && !!node.children[0]) {
				const child = node.children[0];

				if (child.type === "text") {
					if (child.value.startsWith(`--"`)) {
						ComponentName = child.value.replace(`--"`, "");
						mdast.splice(i, 1);
						i--;
						continue;
					}

					if (child.value === `"--`) {
						endIndex = i;
						break;
					}

					elements.push({ paragraph: child.value });
				}
			}
		}

		const rawSection = unified()
			.use(remarkStringify)
			.stringify({ type: "root", children: mdast.slice(0, endIndex) })
			.trim();

		const section: FiveMarkdown = {
			ComponentName,
			rawSection,
			elements,
		};

		if (!isChildren && children.length > 0) section.children = children;

		return section;
	}
}

export const parseMarkdown = ParseMarkdown.parseMarkdown.bind(ParseMarkdown);
export const getSections = ParseMarkdown.getSections.bind(ParseMarkdown);
export const getSection = ParseMarkdown.getSection.bind(ParseMarkdown);
export const findStartIndex = ParseMarkdown.findStartIndex.bind(ParseMarkdown);
export const findEndIndex = ParseMarkdown.findEndIndex.bind(ParseMarkdown);
export const transformSection = ParseMarkdown.transformSection.bind(ParseMarkdown);
