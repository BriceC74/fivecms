import fs from "fs";
import path from "path";

export function loadSchemaFiles(dir: string): string {
	const files = fs.readdirSync(dir);
	return files
		.map((file) => {
			if (file.endsWith(".graphql")) {
				return fs.readFileSync(path.join(dir, file), "utf8");
			}
			return "";
		})
		.join("\n");
}

export const typeDefs = loadSchemaFiles(path.join(import.meta.dirname, "schemas"));
