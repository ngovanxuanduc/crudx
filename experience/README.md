# Kinh nghiệm / Ghi chú phát triển (Dev Experience Notes)

> Thư mục này được commit theo repo nên khi clone/chuyển máy khác là vẫn có sẵn.
> Nội dung đúc kết từ quá trình nâng cấp stack (2026-08): NestJS 8 → 11, TS 4.2 → 5.9, typeorm 0.3 → 1.1.

---

## 1. Stack hiện tại (đã nâng cấp)

| Package | Version | Ghi chú |
|---|---|---|
| TypeScript | `~5.9.3` | KHÔNG lên TS 7.x (xem mục 2) |
| @types/node | `^20.19.0` | typeorm 1.1.0 yêu cầu; node 12.7.5 gãy với TS ≥5.7 |
| NestJS (common/core/platform-express/testing) | `^11.1.29` | |
| @nestjs/swagger | `^11.4.6` | |
| @nestjs/typeorm | `^11.0.3` | bắt buộc ≥11.0.1 cho typeorm 1.x (v10/v11.0.0 crash) |
| typeorm | `1.1.0` | major mới, nhiều API bị xóa |
| redis | `^5.0.0` | khớp peer typeorm 1.x |
| jest | `^30` | |
| ts-jest | `^29.4.12` | |
| jest-extended | `^7` | |
| ts-node | `^10.9.2` | |
| reflect-metadata | `^0.2.2` | |

Node runtime: **v22.22.3** (typeorm 1.1.0 engines: `^20.19 || ^22.13 || >=24.11`).

---

## 2. TypeScript: vì sao không lên 7.x

TS 7 (bản viết lại bằng Go) gây hàng loạt vỡ vụn:

- `import * as deepmerge from "deepmerge"` + gọi `deepmerge(...)` → lỗi `not callable` (namespace-style import). **TS 5.9 compile chạy ngon, không cần sửa code.**
- `@types/node@12.7.5` xung đột `Buffer` (`Uint8Array` thành generic).
- Lỗi lib của chính TS 7: `lib.esnext.intl.d.ts` dùng `DateTimeRangeFormatPart` thiếu reference `es2021.intl`.

→ Dùng **TS 5.9.x** là điểm cân bằng (ổn định, đủ mới cho typeorm 1.x + @types/node 20).

---

## 3. TypeORM 1.x — các API đã bị xóa/đổi (so với 0.3.x)

| API 0.3.x | API 1.x | Vị trí đã sửa |
|---|---|---|
| `ConnectionOptions` | `DataSourceOptions` | `packages/crud-typeorm/src/typeorm-crud.service.ts` |
| `QueryExpressionMap.nativeParameters` | bị xóa hẳn | bỏ 2 dòng copy trong `builderAddBrackets` |
| `QueryRunner.connection` | `QueryRunner.dataSource` | `integration/crud-typeorm/seeds.ts` |
| `AbstractRepository` | bị xóa | `@nestjs/typeorm@11` đã guard (`typeorm_compat`) |

Lưu ý: `@nestjs/typeorm@8.x` dùng `instanceof AbstractRepository` → **crash với typeorm 1.x**. Phải lên `@nestjs/typeorm@11.0.1+` (và Nest 10/11). Kể cả bản mới nhất cũng chỉ khai peer `^0.3.0 || ^1.0.0-dev` — chạy được nhưng có cảnh báo peer.

---

## 4. Express 5 (Nest 11): query parser mặc định đổi — "cú lừa" lớn nhất

- Express 5 default query parser = **`simple`** (dùng `querystring` của Node), KHÔNG còn `qs` (extended).
- Hệ quả: `filter[0]=foo||gt` bị parse thành key literal `"filter[0]"` thay vì array → thư viện CRUD không nhận được filter → mọi request filter/join/sort/fields trả về rỗng.
- **Đã fix ở library** (bền vững cho mọi app): thêm `RequestQueryParser.normalizeQuery()` trong `packages/crud-request/src/request-query.parser.ts` — gom `key[i]` về array.
- Nếu tự viết app Nest 11/Express 5 mà gặp lỗi query kiểu này: hoặc set `app.set('query parser', 'extended')`, hoặc normalize `req.query`.

---

## 5. Jest 30 — các thay đổi gãy

- **Test không được vừa nhận `done` callback vừa `return` promise.** Đã bỏ từ khóa `return` trước `request(` trong 85 test dùng `(done)` (8 file spec).
- `@types/jest@30` **xóa alias `toThrowError`** → phải dùng `toThrow`. (Đã đổi 40 chỗ.)
- `jest-extended@7`: setup phải là **`jest-extended/all`** (chỉ ghi `jest-extended` thì không đăng ký matcher → `toBeArrayOfSize is not a function`).
- Cấu hình ts-jest 29: `globals['ts-jest']` cũ → dùng `transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }] }`; `pathsToModuleNameMapper` import từ `ts-jest` (không phải `ts-jest/utils`).
- `jest.config.js`: `moduleNameMapper` prefix phải khớp tsconfig paths. Paths hiện là `./packages/...` → prefix `'<rootDir>/'` (KHÔNG phải `'<rootDir>/packages/'` → sẽ thành `packages/packages/...`).

---

## 6. @nestjs/swagger 11 — 2 lỗi ẩn

1. **`exports` field chặn subpath require**: `require('@nestjs/swagger/dist/constants')` → `ERR_PACKAGE_PATH_NOT_EXPORTED` (chỉ cho `.`, `./plugin`, `./package.json`).
   → `swagger.helper.ts` có fallback hardcode `DECORATORS` (`swagger/apiOperation`, `swagger/apiResponse`, `swagger/apiParameters`, `swagger/apiExtraModels` — các key này ổn định qua nhiều version).
2. **Bug parse version**: `getSwaggerVersion()` dùng `parseInt(version[0])` — lấy ký tự ĐẦU TIÊN. Với swagger `"11.4.6"` → trả về `1` → nhầm thành oldVersion.
   → Sửa thành `parseInt(version.split(".")[0])`.

---

## 7. Redis + typeorm cache

- `redis` phải là `^5.0.0` (khớp peer typeorm 1.x; redis 3.x không có `client.connect()` mà typeorm cần).
- Cache options trong `integration/crud-typeorm/orm.config.ts` phải dùng **`{ socket: { host, port } }`**:
  ```ts
  cache: { type: "redis", options: { socket: { host: "127.0.0.1", port: 6399 } } }
  ```
  (để `host`/`port` top-level thì redis 4/5/6 bỏ qua → fallback `localhost:6379` → ECONNREFUSED).

---

## 8. Các lệnh & quy trình

```bash
yarn build          # build 4 package (crud-util → crud-request → crud → crud-typeorm)
yarn test:postgres  # reset DB (docker postgres 5455, redis 6399, mysql 3316) + jest
```

- **Phải reset DB trước khi test** (`test:postgres` tự làm). Chạy `yarn test` nhiều lần mà không reset → test count sai kiểu "expected 10 received 14" (dữ liệu create tích lũy).
- Sandbox/môi trường (nếu làm việc trong VS Code agent):
  - `yarn install` cần `COREPACK_HOME="$TMPDIR/corepack"`.
  - `yarn build`/`yarn test` cần chạy không sandbox (đọc `~/.yarnrc`, `~/.cache`).
  - Trong zsh, ký tự `!` trong heredoc bị escape — tránh dùng.

---

## 9. Còn nợ kỹ thuật

- `yarn lint` dùng `tslint@5.20.0` (deprecated, không chạy với TS 5.9) → nên chuyển ESLint hoặc bỏ.
- `@nestjs/typeorm@11` peer vẫn khai typeorm `^0.3.0 || ^1.0.0-dev` (chỉ là cảnh báo, chạy ổn với 1.1.0).
- `.prettierrc.json` đã đổi `singleQuote: false` — cân nhắc thống nhất style.
