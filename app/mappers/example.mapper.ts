import type { ExampleDTO, Example, CreateExample, CreateExampleDTO } from "~/types";

export const mapExample = (dto: ExampleDTO): Example => ({
  id: dto.user_id,
  name: dto.full_name,
  email: dto.email,
  role: dto.role,
  createdAt: dto.created_at,
});

export const mapCreateExampleDTO = (model: CreateExample): CreateExampleDTO => ({
  full_name: model.name,
  email: model.email,
  role: model.role,
});
