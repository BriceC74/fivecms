import { getContents, getContent } from "../lib/utils/GetContents";

export const resolvers = {
	Element: {
		__resolveType(obj: any) {
			if ("heading" in obj) return "FiveHeadingElement";
			if ("paragraph" in obj) return "FiveParagraphElement";
			return null;
		},
	},
	Query: {
		contents(_: any) {
			return getContents();
		},
		content(_: any, { path }: { path: string }) {
			return getContent(path);
		},
	},
};
