export const resolvers = {
	Query: {
		contents(_: any) {
			return [{ title: "Hello World", path: "/hello-world", markdown: `# Heading 1` }];
		},
	},
};
