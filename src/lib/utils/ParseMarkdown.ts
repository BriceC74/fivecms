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
	static parseMarkdown(md: string): FiveMarkdowns {
		const rawSection: Root = unified().use(remarkParse).parse(md);

		const parsedMarkdown: FiveMarkdowns = this.getSections(rawSection.children);

		return parsedMarkdown;
	}

	static getSections(mdast: RootContent[]): FiveMarkdowns {
		const sections: FiveMarkdowns = [];

		while (mdast.length > 1) {
			const { endIndex, section } = this.getSection(mdast);
			sections.push(section);
			mdast.splice(0, endIndex);
		}

		return sections;
	}

	static getSection(mdast: RootContent[]): { endIndex: number; section: FiveMarkdown } {
		let startIndex = this.findStartIndex(mdast);
		let endIndex = this.findEndIndex({ mdast, startIndex });

		const mdastSection = mdast.slice(startIndex, endIndex);
		const transformedSection = this.transformSection(mdastSection);

		return { endIndex, section: transformedSection };
	}

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
