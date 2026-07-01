#!/bin/bash

echo "Connecting to PostgreSQL database..."
echo "
1. Navigating and Describing the Database
\dt — List all tables in the current database (what you were trying to do with show tables).
\d — List all tables, views, and sequences.
\d <table_name> — Describe the schema of a specific table (columns, types, indexes, foreign keys).
\l — List all databases on the server.
\c <database_name> — Connect to a different database.
\du — List all database users and their roles/privileges.
2. Running Queries
To query your tables, write standard SQL queries, but remember each SQL command must end with a semicolon (;):

SELECT * FROM "User"; (Note: Prisma tables are case-sensitive, so use double quotes around table names like "User", "Employee", "Organization", etc.).
SELECT * FROM "Employee";
SELECT * FROM "JobLog" ORDER BY "createdAt" DESC;
3. Help and Exiting
\? — Show help for all backslash \ meta-commands.
\h — Show help for SQL commands (e.g., \h SELECT).
\q — Quit/Exit the shell (what you were trying to do with exit).
"
podman exec -it ela-postgres psql -U admin -d ela_db
