import type { LoginInfoType } from "~/types";

export const useAuthRepository = () => {
  const { get } = useBaseRepository();

  const getLoginInfo = async (): Promise<LoginInfoType> => {
    return await get<LoginInfoType>("/api/sso/login/v1/info");
  };

  return { getLoginInfo };
};
