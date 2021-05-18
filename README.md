# MySQL-Kit

MySQL toolkit base on `mysql` package.

- Promisify `query` method of `mysql`
- Useing pool by default
- Some common shorthand methodes
  - `find`
  - `findOne`
  - `findOneById`
  - `findOneByQuery`
  - `has`
  - `insert`
  - `insertAndFind`
  - `update`
  - `updateAndFind`

## Usage

Install

```sh
# Use yarn
yarn add mysql mysql-kit
yarn add -D @types/mysql

# Use npm
npm install mysql mysql-kit
npm install -D @types/mysql
```

Use

```typescript
import mysqlKit from 'mysql-kit'

// Your mysql config
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: '__mysql_kit_test__',
}
await mysqlKit.connect(config)

await mysqlKit.query('show tables')
```

## Test Coverage

| File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| ----------- | ------- | -------- | ------- | ------- | ----------------- |
| All files   | 100     | 100      | 100     | 100     |
| connect.ts  | 100     | 100      | 100     | 100     |
| event.ts    | 100     | 100      | 100     | 100     |
| format.ts   | 100     | 100      | 100     | 100     |
| index.ts    | 100     | 100      | 100     | 100     |
| query.ts    | 100     | 100      | 100     | 100     |
| replacer.ts | 100     | 100      | 100     | 100     |
| tools.ts    | 100     | 100      | 100     | 100     |
