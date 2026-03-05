import fs from "fs";
import path from "path";

/**
 * Gather into one string all graphql schemas from a specified directory
 * @param dir the directory where .graphql files are stored
 * @returns all types, queries, etc. into one string that can be used by Apollo
 */
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
