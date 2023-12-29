# ElectricDrizzle

This is a proof of concept using [drizzle-orm](https://orm.drizzle.team/)
with [electric-sql](https://electric-sql.com/).

The structure of the project is as follows:

* A code generator for drizzle in  `apps/electric_drizzle-generator`
* A small react library in  `libs/electric-drizzle-react`
* An example with nextjs in `apps/electric_drizzle`

### What works

* Code generator that outputs a reasonable amount of code and is also readable
* No coupling between server orm and client drizzle code
* Basic drizzle queries work (select, insert, update, delete)
* Relational queries work
* live queries work, relation and normal ones

### Limitations

* no special datatype handling (bool to int version, date versions etc)
* some gaps in the typing for relational queries
* code in a rough state, just a proof of concept
* relation are all interpreted as one to many
* "UI" really basic

## Setup

### Install dependencies

```bash
yarn
```

### Start services

docker compose start
```bash
docker compose -f apps/electric-drizzle/backend/docker-compose.yml up -d
```

Run the migrations
```bash
npx nx run electric-drizzle:migrate
```
Start next dev server
```bash
npx nx run electric-drizzle:serve:development
```
App should be available at http://localhost:4200

### Code generation

```bash

npx nx run electric-drizzle-generator:run
```


