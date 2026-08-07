import { SerializeOptions } from "@crudx/crud";
import { GetCompanyResponseDto } from "./get-company-response.dto";

export const serialize: SerializeOptions = {
  get: GetCompanyResponseDto,
};
