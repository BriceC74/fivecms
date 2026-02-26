import { beforeEach, vi, describe, expect, it } from "vitest";
import { getContent, getContents, getContentsClass, getMarkdown } from "../getContents";
import fs from "node:fs";
import * as matter from "gray-matter";

let spiedGM = vi.spyOn(getContentsClass, "getMarkdown");
let spiedGC = vi.spyOn(getContentsClass, "getContent");
let spiedGCP = vi.spyOn(getContentsClass, "CONTENT_PATH", "get");
let spiedRDS = vi.spyOn(fs, "readdirSync");
let spiedRFS = vi.spyOn(fs, "readFileSync");
vi.mock("gray-matter", { spy: true });

let mockedFrontmatter = {
	data: {
		title: "Mocked page",
	},
	content: "# Heading 1\nContent.",
	language: "en",
	orig: "",
	matter: "",
	stringify: () => "",
};

beforeEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
	vi.resetAllMocks();

	spiedGM = vi.spyOn(getContentsClass, "getMarkdown");
	spiedGC = vi.spyOn(getContentsClass, "getContent");
	spiedGCP = vi.spyOn(getContentsClass, "CONTENT_PATH", "get");
	spiedRDS = vi.spyOn(fs, "readdirSync");
	spiedRFS = vi.spyOn(fs, "readFileSync");
	vi.mock("gray-matter", { spy: true });

	spiedGCP.mockImplementation(() => "/test/path");

	const mockedDirs = ["page.md", "about/page.md"] as unknown as [];
	spiedRDS.mockImplementation(() => mockedDirs);
	spiedRFS.mockImplementation(() => "# Mocked markdown");

	mockedFrontmatter = {
		data: {
			title: "Mocked page",
		},
		content: "# Heading 1\nContent.",
		language: "en",
		orig: "",
		matter: "",
		stringify: () => "",
	};
	vi.mocked(matter.default).mockImplementation(() => mockedFrontmatter);
});

describe("getContents", () => {
	it(`should call "getContent" with the correct path`, () => {
		spiedGM.mockImplementation(() => "");
		spiedGC.mockImplementation(() => ({ path: "/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter }));

		getContents();

		expect(spiedGC).toBeCalledTimes(2);
		expect(spiedGC).toHaveBeenNthCalledWith(1, "page.md");
		expect(spiedGC).toHaveBeenNthCalledWith(2, "about/page.md");
	});

	it("should return an array of content objects", () => {
		spiedGM.mockImplementation(() => "");
		spiedGC.mockImplementationOnce(() => ({ path: "/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter }));
		spiedGC.mockImplementationOnce(() => ({ path: "about/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter }));

		const expectedResult = [
			{ path: "/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter },
			{ path: "about/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter },
		];

		const result = getContents();

		expect(Array.isArray(result)).toBe(true);
		expect(result).toStrictEqual(expectedResult);
	});
});

describe("getContent", () => {
	it(`should call "getMarkdown" with the correct path`, () => {
		spiedGM.mockImplementation(() => "");

		getContent("/");

		expect(spiedGM).toBeCalledTimes(1);
		expect(spiedGM).toHaveBeenNthCalledWith(1, "/test/path/page.md");
	});

	it("should return an array of content objects", () => {
		spiedGM.mockImplementation(() => "");

		const expectedResult = { path: "/test/path/page.md", rawMarkdown: "", frontmatter: mockedFrontmatter };

		const result = getContent("/");

		expect(result).toStrictEqual(expectedResult);
	});
});

describe("getMarkdown", () => {
	it("should call fs.readFileSync with the correct path", () => {
		const mockContent = "# Mocked markdown";
		spiedRFS.mockImplementation(() => mockContent);

		const result = getMarkdown("/test/path/page.md");

		expect(spiedRFS).toHaveBeenCalledWith("/test/path/page.md", { encoding: "utf-8" });
		expect(result).toBe("# Mocked markdown");
	});

	it("should add page.md to the path if it doesn't end with", () => {
		const mockContent = "# Mocked markdown";
		spiedRFS.mockImplementation(() => mockContent);

		const result = getMarkdown("/test/path");

		expect(spiedRFS).toHaveBeenCalledWith("/test/path/page.md", { encoding: "utf-8" });
		expect(result).toBe("# Mocked markdown");
	});
});
