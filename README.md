## Description

LuckyKing Service

Tech: NestJS + Prisma + PostgresSQL + Nginx

## Clone

```bash
# Clone with SSH
$ git clone git@gitlab.com:vptjsc/xsapp_backend.git

# Clone with HTTPS
$ git clone https://gitlab.com/vptjsc/xsapp_backend.git
```

## Installation

Install Docker Engine at https://docs.docker.com/engine/install/

```bash
$ npm i -g yarn
$ npm i -g prisma
# Install node_modules
$ yarn install
```

## Prepare Environment

Rename `.evn.example` to `.env`  
If run in debug mode: comment all # DB_HOST for docker  
If run in docker mode: comment all # DB_HOST for debug  

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

# docker mode
$ docker compose up -d

# view visually database
$ npx prisma studio
```


## Deploy with MacOS

Pull Project -> Rename `.evn.example` to `.env`

```bash
$ set -a
$ source .env
$ docker compose buid
$ docker compose up --no-spec -d
```
 
<!-- ## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
``` -->

## Stay in touch

- Author - h1eu_traN (hieutm9x@gmail.com)

## License

UNLICENSED
