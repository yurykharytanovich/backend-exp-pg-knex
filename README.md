Creating a migration:

```
node_modules/db-migrate/bin/db-migrate create [YOUR_NAME] --sql-file
```

To sun migrations, setup an env variable:
DATABASE_URL= postgres://usr:usr@localhost:5432/backend_prototype_db


Generating migration from csv file:
1. Run `npm run mfc --ent=*** --dir=down`
2. Copy downloaded csv file to csv-for-migration folder.
3. Name it as one of entities, presented into `scripts/constants`
4. Run `npm run mfc --ent=*** --dir=up`
5. Create new migration.
6. Copy code from generated sqls from forlder `csv-for-migration` to generated migration sql
7. Delete generated sql scripts from `csv-for-migration`

Making db dump:

pg_dump -h recome.cldcdqrxlqdh.eu-west-1.rds.amazonaws.com -U recome -d recome_stage > recome_dump.sql
# backend-exp-pg-knex
