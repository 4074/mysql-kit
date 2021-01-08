# Mysql-Kit

Mysql toolkit for node.js

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

await connect()

quert('show tables')
```
