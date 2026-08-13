# CRUDX Roadmap (v6)

> **Version:** v6
>
> **Status:** 🚧 In Progress
>
> CRUDX là một fork của `crudx-nestjs-crud`, với mục tiêu xây dựng một framework CRUD hiện đại cho NestJS, hỗ trợ TypeORM mới nhất, dễ mở rộng và có kiến trúc rõ ràng hơn.

---

# Vision

CRUDX hướng tới các mục tiêu sau:

- Hỗ trợ NestJS phiên bản mới nhất.
- Hỗ trợ TypeORM phiên bản mới nhất.
- Backward compatible với phần lớn API của `crudx-nestjs-crud`.
- Cải thiện khả năng mở rộng.
- Dễ bảo trì.
- Có thể hỗ trợ nhiều ORM trong tương lai.

---

# Tech Stack

| Component  | Version |
| ---------- | ------- |
| Node.js    | >= 22   |
| Yarn       | 4.x     |
| TypeScript | 5.9     |
| NestJS     | 11      |
| TypeORM    | 1.x     |
| ESLint     | 9       |
| Changesets | Latest  |

---

# Project Structure

```text
packages/
├── core/
├── request/
├── typeorm/
├── util/

examples/
└── nestjs-typeorm/

docs/

.github/
```

---

# Development Strategy

Không rewrite toàn bộ project.

Áp dụng chiến lược:

> **Fork → Build → Release → Refactor → Feature**

Mỗi milestone đều phải release được.

Không giữ code trong trạng thái "đang làm dở" quá lâu.

---

# Milestone 1 — Bootstrap

## Goal

Đưa project lên stack hiện đại và build thành công.

## Tasks

### Repository

- [x] Đổi package namespace thành `@crudx2/*`
- [x] Đổi README
- [ ] Đổi LICENSE (nếu cần)
- [x] Thiết lập GitHub Actions
- [ ] Thiết lập Changesets
- [x] Chuẩn hóa Yarn Workspace

---

### Dependency Upgrade

- [x] Node.js 22+
- [ ] Yarn 4
- [x] NestJS 11
- [x] TypeScript 5.9
- [x] TypeORM 1.x
- [x] class-validator
- [x] class-transformer
- [x] rxjs
- [x] reflect-metadata

---

### Build

- [x] `yarn install`
- [x] `yarn build`
- [ ] `yarn lint`
- [x] `yarn test`

Tất cả phải chạy thành công.

---

### Release

- [x] `v6.0.0-alpha.1`

---

# Milestone 2 — Compatibility

## Goal

Đảm bảo CRUD hoạt động ổn định trên TypeORM 1.x.

## Tasks

### CRUD

- [x] Create
- [x] Read
- [x] Update
- [x] Delete

---

### Query

- [x] Filter
- [x] Search
- [x] Sort
- [x] Pagination
- [x] Join

---

### TypeORM

- [x] Repository
- [x] QueryBuilder
- [x] Relation
- [x] Soft Delete
- [x] Transactions

---

### Testing

Tăng test coverage cho:

- [x] Parser
- [x] CRUD
- [x] Repository
- [x] QueryBuilder

---

### Release

- [ ] `v6.0.0`

---

# Milestone 3 — Internal Refactor

## Goal

Tách TypeORM khỏi Core.

Hiện tại:

```text
Controller
      │
CrudService
      │
TypeORM
```

Mục tiêu:

```text
Controller
      │
CRUD Core
      │
CRUD Adapter
      │
TypeORM
```

---

## Tasks

- [ ] Tạo `CrudAdapter`
- [ ] Di chuyển logic TypeORM vào Adapter
- [ ] Giảm dependency trực tiếp vào QueryBuilder
- [ ] Chuẩn hóa interface nội bộ

Ví dụ:

```ts
interface CrudAdapter {
  find();

  create();

  update();

  delete();
}
```

---

### Release

```
v6.1.0
```

---

# Milestone 4 — Query Engine

Đây là milestone quan trọng nhất.

Hiện tại:

```text
HTTP Query

↓

Parser

↓

TypeORM QueryBuilder
```

Mục tiêu:

```text
HTTP Query

↓

DSL Parser

↓

AST

↓

Planner

↓

Adapter

↓

ORM
```

## Tasks

- [ ] Thiết kế AST
- [ ] Refactor Parser
- [ ] Query Planner
- [ ] AST → QueryBuilder

---

### Release

```
v6.2.0
```

---

# Milestone 5 — Features

## Pagination

- [ ] Cursor Pagination
- [ ] Keyset Pagination

---

## Query

- [ ] CTE
- [ ] Window Function
- [ ] Aggregate
- [ ] Group By
- [ ] Having

---

## JSON

- [ ] PostgreSQL JSON Query
- [ ] MySQL JSON Query

---

### Release

```
v6.3.0
```

---

# Milestone 6 — Security

## Tasks

- [ ] Filter whitelist
- [ ] Join whitelist
- [ ] Field blacklist
- [ ] Maximum page size
- [ ] Maximum join depth

---

### Release

```
v6.4.0
```

---

# Milestone 7 — Performance

## Tasks

- [ ] Query Planner Optimization
- [ ] Filter Merge
- [ ] Alias Optimization
- [ ] Join Optimization
- [ ] Lazy Query Build

---

### Release

```
v6.5.0
```

---

# Milestone 8 — Plugin System

Mục tiêu:

```text
CRUD Core

├── Audit Plugin
├── Tenant Plugin
├── ACL Plugin
├── Cache Plugin
├── Search Plugin
└── Soft Delete Plugin
```

Ví dụ:

```ts
CrudModule.forRoot({
  plugins: [AuditPlugin, TenantPlugin],
});
```

---

### Release

```
v7.0.0
```

---

# Public API Policy

Trong v6:

Ưu tiên giữ nguyên API hiện tại.

Ví dụ:

- `@Crud()`
- `@CrudAuth()`
- `@Override()`
- Request DSL
- Swagger Integration

Không thay đổi nếu không thực sự cần thiết.

---

# Release Flow

```
Feature Branch

↓

Pull Request

↓

Review

↓

Merge

↓

Changeset

↓

Release
```

---

# Future ORM Support

Sau khi hoàn thành TypeORM:

- Prisma
- Drizzle
- MikroORM

Thông qua Adapter Layer.

---

# Principles

## ✅ Release nhỏ, thường xuyên

Không giữ feature quá lâu.

---

## ✅ Backward Compatibility

Không phá API nếu không cần.

---

## ✅ Test trước Refactor

Refactor phải có test bảo vệ.

---

## ✅ Core không phụ thuộc ORM

Mọi ORM đều đi qua Adapter.

---

## ✅ Public API ổn định

Có thể thay đổi Internal API.

Không thay đổi Public API nếu không có breaking reason.

---

# Backlog

## High Priority

- [ ] NestJS 11
- [ ] TypeORM 1.x
- [ ] Yarn 4
- [ ] CI/CD
- [ ] Changesets
- [ ] Test Coverage

---

## Medium Priority

- [ ] Cursor Pagination
- [ ] CTE
- [ ] Aggregate
- [ ] Window Function

---

## Low Priority

- [ ] Prisma Adapter
- [ ] Drizzle Adapter
- [ ] GraphQL Integration
- [ ] Documentation Website

---

# Long-term Goal

CRUDX không chỉ là thư viện tự động sinh CRUD.

Mục tiêu cuối cùng là trở thành một **Query Engine cho NestJS**.

Người dùng chỉ cần định nghĩa DSL một lần, CRUDX sẽ chịu trách nhiệm phân tích, tối ưu và chuyển đổi thành truy vấn tương ứng cho từng ORM.

```text
HTTP Request
      │
      ▼
CRUDX DSL
      │
      ▼
Parser
      │
      ▼
AST
      │
      ▼
Planner
      │
      ▼
Adapter
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
TypeORM Prisma     Drizzle
```

Đến thời điểm đó, giá trị cốt lõi của CRUDX sẽ không còn nằm ở việc sinh CRUD tự động, mà nằm ở **DSL + Query Engine + Adapter Architecture**, cho phép mở rộng và thay thế ORM mà không làm thay đổi API phía ứng dụng.
