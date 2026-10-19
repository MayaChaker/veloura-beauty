// Stand-in for src/server/catalogue.ts in Jest: server pages read the catalogue files instead of
// the database, so unit tests need no Postgres. The database itself is checked in CI's build.
import { catalogue } from "./catalogue";

export const getCatalogue = async () => catalogue;
