export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointStatus = 'draft' | 'active' | 'deprecated' | 'error';

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  handler: string;
  description: string;
  status: EndpointStatus;
  createdAt: string;
}

export interface ApiState {
  endpoints: ApiEndpoint[];
  deployedEndpoints: string[];
}

export interface RequestResponse {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}
