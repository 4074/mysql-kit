# MySQL-Kit

MySQL toolkit base on `mysql` package.

- Promisify `query` method of `mysql`
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
import connect, { query } from 'mysql-kit'

// Your mysql config
const config = {}
await connect(config)

query('show tables')
```

## Test Coverage

| File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| ----------- | ------- | -------- | ------- | ------- | ----------------- |
| All files   | 100     | 100      | 100     | 100     |
| src         | 100     | 100      | 100     | 100     |
| connect.ts  | 100     | 100      | 100     | 100     |
| event.ts    | 100     | 100      | 100     | 100     |
| format.ts   | 100     | 100      | 100     | 100     |
| index.ts    | 100     | 100      | 100     | 100     |
| query.ts    | 100     | 100      | 100     | 100     |
| replacer.ts | 100     | 100      | 100     | 100     |
| tools.ts    | 100     | 100      | 100     | 100     |
| test        | 100     | 100      | 100     | 100     |
| config.ts   | 100     | 100      | 100     | 100     |
