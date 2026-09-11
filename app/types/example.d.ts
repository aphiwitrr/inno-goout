export interface ExampleDTO {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Example {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateExampleDTO {
  full_name: string;
  email: string;
  role: string;
}

export interface CreateExample {
  name: string;
  email: string;
  role: string;
}
