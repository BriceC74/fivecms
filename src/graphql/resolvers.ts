import { getContents, getContent } from "../lib/utils/getContents";

export const resolvers = {
	Query: {
		contents(_: any) {
			return getContents();
		},
		content(_: any, { path }: { path: string }) {
			return getContent(path);
		},
	},
};
