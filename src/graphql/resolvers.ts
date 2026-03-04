import { getContents, getContent } from "../lib/utils/GetContents";

export const resolvers = {
	Element: {
		__resolveType(obj: any) {
			if ("heading" in obj) return "FiveHeadingElement";
			if ("paragraph" in obj) return "FiveParagraphElement";
			return null;
		},
	},
	Component: {
		children: async (parent, { depth = 3 }) => {
			if (depth <= 0 || !parent.children) return null;

			return parent.children.map((child) => ({
				...child,
				_resolverDepth: depth - 1,
			}));
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

/*
query ExampleQuery($path: String!) {
  content(path: $path) {
    sections {
      ...ComponentFields
      children(depth: 3) {
        ...ComponentFields
      }
    }
  }
}

fragment ComponentFields on Component {
  ComponentName
  rawSection
  elements {
    ... on FiveHeadingElement {
      heading {
        level
        text
      }
    }
    ... on FiveParagraphElement {
      paragraph
    }
  }
}
*/
