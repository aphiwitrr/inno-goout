import type { LoginInfoType } from "./login-info";

export type WatermarkPersonInfo = LoginInfoType["user"];

// Deliberately open string-literal union — tomorrow's protection techniques extend this
export type WatermarkTechniqueId = "none";

export type WatermarkMockData = {
  person: WatermarkPersonInfo
  imageBase64: string
};
