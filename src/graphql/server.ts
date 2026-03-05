import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schemas";
import { resolvers } from "./resolvers";

/**
 * Run an Apollo instance that handles graphql queries and give a web interface.
 */
export const startGraphqlServer = async () => {
	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});

	try {
		const { url } = await startStandaloneServer(server, {
			listen: { port: 4000 },
		});
		console.log(`🚀 Server ready at: ${url}`);
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
};
