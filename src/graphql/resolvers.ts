import getContents from "../lib/utils/getContents";

export const resolvers = {
	Query: {
		contents(_: any) {
			return getContents();
		},
	},
};
