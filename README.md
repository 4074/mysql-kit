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

| File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| ---------- | ------- | -------- | ------- | ------- | ----------------- |
| All files  | 91.84   | 65.71    | 93.1    | 91.76   |
| connect.ts | 100     | 83.33    | 100     | 100     | 38                |
| index.ts   | 100     | 100      | 100     | 100     |
| query.ts   | 86.67   | 60       | 90      | 86.54   | 15-16,22-25,81    |
| tools.ts   | 100     | 75       | 100     | 100     | 3                 |
