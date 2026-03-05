# FIVECMS

**A flat-file CMS designed to be as flexible as possible.**

## Quick overview

[See more about the principles](docs/PRINCIPLES.md)

This project is a core of a CMS. It is designed to be as flexible as possible.

The idea is simple you have 2 core folders inside the src/data directory :

- content
- locales

And it will be served with Graphql.

### Content

It contains all pages, posts, etc. in a custom flavor markdown.

A typical structure looks like this :

```
content
├── about
│   └── page.md
├── blog
│   ├── page.md
│   ├── post-1
│   │   └── page.md
│   └── post-2
│       └── page.md
└── page.md
```

If you want to create a new page, you just have to create a new folder with a page.md file inside.
The page.md file is a markdown file with a front matter support.

### Locales

It contains all translations in a po file.
he is a mirror of the content folder structure.

```
locales
├── about
│   ├── en.po
│   └── fr.po
├── blog
│   ├── en.po
│   ├── fr.po
│   ├── post-1
│   │   ├── en.po
│   │   └── fr.po
│   └── post-2
│       ├── en.po
│       └── fr.po
├── en.po
└── fr.po
```

If you want to create a new language, you need to create a new file inside each folder with the language code as the file name (eg: es.po, cs.po, etc.)

### Graphql

Graphql is a query language for APIs and a runtime for fulfilling those queries with your existing data.
And it's a mature technology, used by many companies like Facebook, Netflix, etc.
It can be implemented in a lot of languages, and it's easy to learn.

## Installation

```bash
npm ci
```

`npm ci` is used instead of npm install to ensure that the exact versions of the dependencies are installed as specified in the package-lock.json file. This is important for ensuring that the application runs consistently across different environments.

## Usage

```bash
npm run build
```

It will generate all graphql schemas and prepare it to be resolved by the server.

```bash
npm run start
```

It will launch the graphql server on port 4000.

```bash
npm run build.start
```

It will build and launch the graphql server on port 4000.

Then you can access the graphql playground at http://localhost:4000/graphql

### Example of queries

Gather all content from all page.md:

```graphql
query ExampleQuery {
	contents {
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
```

Gather all content from a specified page.md:

```graphql
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
```
