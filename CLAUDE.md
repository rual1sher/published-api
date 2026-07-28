# Project Instructions

## Stack

- Express + TypeScript, Prisma ORM (PostgreSQL)
- Zod для валидации DTO
- tsx для dev-режима (не ts-node)

## Architecture

- src/modules/<name>/ — каждый модуль: routes.ts, service.ts, dto.ts
- Роуты не лезут напрямую в Prisma — только через service
- Ошибки бросаем через AppError (src/common/errors), ловит error-handler middleware

## Commands

- `npm run dev` — запуск дев-сервера
- `npm run lint` — обязательно перед коммитом
- `npx prisma migrate dev` — после изменения schema.prisma

## Conventions

- Именование файлов: kebab-case
- Не создавать миграции руками — только через prisma migrate
