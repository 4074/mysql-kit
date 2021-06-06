# MySQL-Kit

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage][codecov-image]][codecov-url]

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

[npm-image]: https://img.shields.io/npm/v/mysql-kit?style=flat-square
[npm-url]: https://www.npmjs.com/package/mysql-kit
[travis-image]: https://img.shields.io/travis/com/4074/mysql-kit?style=flat-square
[travis-url]: https://travis-ci.com/4074/mysql-kit
[codecov-image]: https://img.shields.io/codecov/c/github/4074/mysql-kit.svg?style=flat-square
[codecov-url]: https://app.codecov.io/gh/4074/mysql-kit?branch=main
