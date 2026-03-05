# The idea

Behind this simple CMS, there is a simple idea : **a CMS should be as flexible as possible**.
At first it will be written in Typescript and will be used to generate a static website, BUT at the end, you would be able to choose your own server language.

The language doesn't matter, the only thing that matters is the structure of the files and the way you want to use them.

## Core concept

I encourage everybody who wants to use this headless CMS to create their own tools around it.
FiveCMS will provide the content and the structure of it, but the way you want to use it is up to you.

You can create a WYSIWYG editor, a CLI tool, a mobile app, preview panels, etc.
This cms is a content manager, not a content editor. This way of thinking will make it modular and flexible.
I kinda use the SRP (Single Responsibility Principle) to make it as flexible as possible.

## QnA

### Why not use a existing CMS?

TinaCMS, Strapi, etc. are great, but they are not flexible enough for me.
I want to be able to migrate my content from one language to the other without too much hussle.

### Why not use a database?

Databases are great and very fast but in the era of AI and text responses I think it lacks readability.

I want to have the choice how to edit my content (code editor, text editor, WYSIWYG, etc.).
And also I want it to be as readable as possible for a human being.
With a git implementation you can have a strong versionning system.

### How can I draft my content?

You can simply add a `draft.md` file in your content and it will provide a draft url inside the graphql api.
You can then edit it and when you are ready you can rename it `page.md` and it will be published.

#### What about previews?

You can use the draft url to preview your content in real time.
It's yours to implement a preview system with your frontend framework/language.

### Why po files?

PO files are a standard for translations. And are used by a lot of professional translators.
It's a simple format, easy to read and easy to edit.

### Why Graphql?

Graphql is used by a lot of companies like Facebook, Netflix, etc.
It can be implemented in a lot of languages, and it's easy to learn.
It gives a standardized way to query data.

#### Why not REST APIs then?

It's way harder to implement and maintain them in differents languages with different constraints.

### What about navigation systems?

This is the tricky part and it would change a lot in development phase.
Navigations systems are not standardized and can be very different from one project to another.

It would be YAML files inside the nav/ folder.

```
src/data/nav
├── custom.yaml
├── footer.yaml
└── header.yaml
```

Each file can be called by a specific query in Graphql.
It will return a list of nested links with options, like :

- title
- slug
- url
- image
  - src
  - alt
- children
- etc.

That way you can manage your navigation system in a very flexible way.

### What about SEO?

In every page.md file, you can add a front matter with SEO options, like :

- title
- description
- og
  - image
  - title
  - description
  - url
- twitter
  - image
  - title
  - description
  - url
- etc.

If you do not specify them it will generate a placeholder using the first H1 or H2.
But ultimatly it will mostly depends on the front-end and how you serve it.

### What about images?

Images are stored in the src/data/images folder. It's yours to organize them as you want.
You can use them in your markdown files with the following syntax : `![alt](src/data/images/your-image.jpg)`.

### What about assets?

For now there aren't any assets. But it's a good idea to add them in the future.
