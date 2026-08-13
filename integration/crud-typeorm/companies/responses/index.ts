import { SerializeOptions } from "@crudx2/crud";
import { GetCompanyResponseDto } from "./get-company-response.dto";

export const serialize: SerializeOptions = {
  get: GetCompanyResponseDto,
};
