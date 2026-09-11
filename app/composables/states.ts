import type { LoginInfoType } from "~/types";

export const useLoginInfo = () => useState<LoginInfoType | null>("loginInfo", () => null);
