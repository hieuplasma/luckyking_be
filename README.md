## Description

Service cho he thong mua ho ve so xo (Vietpointer)

## Installation

Install Docker Engine at https://docs.docker.com/engine/install/

```bash
$ yarn install
```


## Prepare Environment

```bash
# create & run container for postgres SQL
$ yarn db:dev:create

# migrate dev database
$ yarn prisma:dev:migrate
```

## Running the app


```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# view visually database
$ npx prisma studio
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Stay in touch

- Author - hieutm19

## License

Nest is [MIT licensed](LICENSE).
