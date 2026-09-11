import type { ApiResponse, QueryParams, ExampleDTO, CreateExampleDTO } from "~/types";

export const useExampleRepository = () => {
  const { get, post } = useBaseRepository();

  const getExamples = async (params?: QueryParams, silent?: boolean): Promise<ApiResponse<ExampleDTO[]>> => {
    return await get<ApiResponse<ExampleDTO[]>>("/examples", params, silent);
  };

  const getExampleById = async (id: number, silent?: boolean): Promise<ApiResponse<ExampleDTO>> => {
    return await get<ApiResponse<ExampleDTO>>(`/examples/${id}`, undefined, silent);
  };

  const createExample = async (body: CreateExampleDTO, silent?: boolean): Promise<ApiResponse<ExampleDTO>> => {
    return await post<ApiResponse<ExampleDTO>>("/examples", body, silent);
  };

  return { getExamples, getExampleById, createExample };
};
