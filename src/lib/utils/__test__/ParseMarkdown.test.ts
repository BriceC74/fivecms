import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	findEndIndex,
	findStartIndex,
	FiveMarkdown,
	getSection,
	getSections,
	ParseMarkdown,
	parseMarkdown,
	transformSection,
} from "../ParseMarkdown";
import mockedMdastJSON from "./mockedMdast.json";
import { RootContent } from "mdast";

let mockedMdast = structuredClone(mockedMdastJSON);

let md = `

--"ComponentA

# Heading 1
ComponentA content.

"--

--"ComponentB

## Heading 2
ComponentB content.

---

### Heading 3 card 1
Card 1 content.

---

### Heading 3 card 2
Card 2 content.

"--
`;

let mdast: RootContent[] = [];

const mockedComponentA: FiveMarkdown = {
	ComponentName: "ComponentA",
	rawSection: "# Heading 1\n\nComponentA content.",
	elements: [{ heading: { level: 1, text: "Heading 1" } }, { paragraph: "ComponentA content." }],
};

const mockedComponentB: FiveMarkdown = {
	ComponentName: "ComponentB",
	rawSection:
		"## Heading 2\n\nComponentB content.\n\n***\n\n### Heading 3 card 1\n\nCard 1 content.\n\n***\n\n### Heading 3 card 2\n\nCard 2 content.",
	elements: [{ heading: { level: 2, text: "Heading 2" } }, { paragraph: "ComponentB content." }],
	children: [
		{
			ComponentName: "GenericComponent",
			rawSection: "### Heading 3 card 1\n\nCard 1 content.",
			elements: [
				{
					heading: {
						level: 3,
						text: "Heading 3 card 1",
					},
				},
				{ paragraph: "Card 1 content." },
			],
		},
		{
			ComponentName: "GenericComponent",
			rawSection: "### Heading 3 card 2\n\nCard 2 content.",
			elements: [
				{
					heading: {
						level: 3,
						text: "Heading 3 card 2",
					},
				},
				{ paragraph: "Card 2 content." },
			],
		},
	],
};

let spiedFSI = vi.spyOn(ParseMarkdown, "findStartIndex");
let spiedFEI = vi.spyOn(ParseMarkdown, "findEndIndex");
let spiedTS = vi.spyOn(ParseMarkdown, "transformSection");

beforeEach(() => {
	vi.clearAllMocks();
	vi.resetAllMocks();
	vi.restoreAllMocks();

	mockedMdast = structuredClone(mockedMdastJSON);

	mdast = [
		{ type: "paragraph", children: [{ type: "text", value: `--"ComponentA` }] },
		{ type: "heading", depth: 1, children: [{ type: "text", value: "Heading 1" }] },
		{ type: "paragraph", children: [{ type: "text", value: "ComponentA content." }] },
	];

	spiedFSI = vi.spyOn(ParseMarkdown, "findStartIndex");
	spiedFEI = vi.spyOn(ParseMarkdown, "findEndIndex");
	spiedTS = vi.spyOn(ParseMarkdown, "transformSection");
});

describe("parseMarkdown", () => {
	it("should call getSections", () => {
		const spiedOn = vi.spyOn(ParseMarkdown, "getSections");
		spiedOn.mockImplementation(() => []);

		parseMarkdown(md);

		expect(spiedOn).toBeCalledWith(mockedMdast.children);
	});

	it("should parse markdown", () => {
		const spiedOn = vi.spyOn(ParseMarkdown, "getSections");
		spiedOn.mockImplementation(() => [mockedComponentA, mockedComponentB]);

		const expectedResult = [mockedComponentA, mockedComponentB];

		const result = parseMarkdown(md);

		expect(result).toStrictEqual(expectedResult);
	});
});

describe("getSections", () => {
	it("should call getSection", () => {
		const spiedOn = vi.spyOn(ParseMarkdown, "getSection");

		getSections(mockedMdast.children);

		expect(spiedOn).toBeCalledTimes(2);
		expect(spiedOn).toBeCalledWith(mockedMdast.children);
	});

	it("should return 2 sections", () => {
		const result = getSections(mockedMdast.children);

		expect(result).toStrictEqual([mockedComponentA, mockedComponentB]);
	});
});

describe("getSection", () => {
	it("should call findStartIndex", () => {
		spiedFSI.mockImplementationOnce(() => 0);
		spiedFEI.mockImplementationOnce(() => 3);

		getSection(mockedMdast.children);

		expect(spiedFSI).toBeCalledWith(mockedMdast.children);
	});

	it("should call findEndIndex", () => {
		spiedFSI.mockImplementationOnce(() => 0);
		spiedFEI.mockImplementationOnce(() => 3);

		getSection(mockedMdast.children);

		expect(spiedFEI).toBeCalledWith({
			mdast: mockedMdast.children,
			startIndex: 0,
		});
	});

	it.todo("should call transformSection");

	it("should get section", () => {
		spiedFSI.mockImplementationOnce(() => 0);
		spiedFEI.mockImplementationOnce(() => 3);

		const result = getSection(mdast);

		expect(result).toStrictEqual({ endIndex: 3, section: mockedComponentA });
	});
});

describe("findStartIndex", () => {
	it(`should return the index of the first opening custom delimiter (--")`, () => {
		const mdast: RootContent[] = [
			{
				type: "paragraph",
				children: [{ type: "text", value: `--"ComponentA` }],
			},
		];

		const result = findStartIndex(mdast);

		expect(result).toStrictEqual(0);
	});
});

describe("findEndIndex", () => {
	it(`should return the index of the first closing custom delimiter ("--)`, () => {
		const result = findEndIndex({ mdast, startIndex: 0 });

		expect(result).toStrictEqual(3);
	});
});

describe("transformSection", () => {
	it("should return a FiveMarkdown section", () => {
		const result = transformSection(mdast);

		expect(result).toStrictEqual(mockedComponentA);
	});

	it(`should call himself where there is a children`, () => {
		const spiedOn = vi.spyOn(ParseMarkdown, "transformSection");

		const mdast: RootContent[] = [
			{ type: "paragraph", children: [{ type: "text", value: `--"ComponentB` }] },
			{ type: "heading", depth: 2, children: [{ type: "text", value: "Heading 2" }] },
			{ type: "paragraph", children: [{ type: "text", value: "ComponentB content." }] },
			{ type: "thematicBreak" },
			{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 1" }] },
			{ type: "paragraph", children: [{ type: "text", value: "Card 1 content." }] },
			{ type: "thematicBreak" },
			{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 2" }] },
			{ type: "paragraph", children: [{ type: "text", value: "Card 2 content." }] },
			{ type: "paragraph", children: [{ type: "text", value: `"--` }] },
		];

		transformSection(mdast);

		expect(spiedOn).toBeCalledTimes(2);
		expect(spiedOn).toHaveBeenNthCalledWith(
			1,
			[
				{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 1" }] },
				{ type: "paragraph", children: [{ type: "text", value: "Card 1 content." }] },
				{ type: "thematicBreak" },
				{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 2" }] },
				{ type: "paragraph", children: [{ type: "text", value: "Card 2 content." }] },
				{ type: "paragraph", children: [{ type: "text", value: `"--` }] },
			],
			true,
		);
		expect(spiedOn).toHaveBeenNthCalledWith(
			2,
			[
				{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 2" }] },
				{ type: "paragraph", children: [{ type: "text", value: "Card 2 content." }] },
				{ type: "paragraph", children: [{ type: "text", value: `"--` }] },
			],
			true,
		);
	});

	it("should return children", () => {
		const mdast: RootContent[] = [
			{ type: "paragraph", children: [{ type: "text", value: `--"ComponentB` }] },
			{ type: "heading", depth: 2, children: [{ type: "text", value: "Heading 2" }] },
			{ type: "paragraph", children: [{ type: "text", value: "ComponentB content." }] },
			{ type: "thematicBreak" },
			{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 1" }] },
			{ type: "paragraph", children: [{ type: "text", value: "Card 1 content." }] },
			{ type: "thematicBreak" },
			{ type: "heading", depth: 3, children: [{ type: "text", value: "Heading 3 card 2" }] },
			{ type: "paragraph", children: [{ type: "text", value: "Card 2 content." }] },
			{ type: "paragraph", children: [{ type: "text", value: `"--` }] },
		];

		const result = transformSection(mdast);

		expect(result).toStrictEqual(mockedComponentB);
	});
});
