# Nest Spanner Sample
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript sample.

* Nest.js + [Cloud Spanner](https://cloud.google.com/spanner)
* with Cloud Spanner thin orm
* with Docker
* with Cloud Spanner emulator

## Installation

```bash
$ yarn 
```

## 確認方法
* nest-spanner がファイル参照なので、Docker化できないため、ローカルでnest アプリを動かします

```bash
$ docker-compose down
$ docker-compose up  # spanner エミュレータの起動

$ yarn start:dev   # ローカルでnestアプリを起動
```

## Access

```bash
## Singer Create
curl -X "POST" "http://localhost:3000/singers"
## Singer All
curl "http://localhost:3000/singers"
## Singer get
curl "http://localhost:3000/singers/13"
## Singer Update
curl -X "PATCH" "http://localhost:3000/singers/13"
```
