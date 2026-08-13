import { SerializeOptions } from "@crudx2/crud";
import { DeleteDeviceResponseDto } from "./delete-device-response.dto";

export const serialize: SerializeOptions = {
  delete: DeleteDeviceResponseDto,
};
