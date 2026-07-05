import { ApiService } from './api.service';
import { ApiEndpoint, HttpMethod } from './api.types';

export class Api {
  private service: ApiService;

  constructor() {
    this.service = new ApiService();
  }

  createEndpoint(path: string, method: HttpMethod, handler: string, description: string): ApiEndpoint {
    const endpoint = this.service.createEndpoint(path, method, handler, description);
    console.log(`Api: Endpoint "${endpoint.id}" created (${method} ${path}).`);
    return endpoint;
  }

  getEndpoint(endpointId: string): ApiEndpoint | undefined {
    return this.service.findEndpoint(endpointId);
  }

  deployEndpoint(endpointId: string): void {
    this.service.deployEndpoint(endpointId);
    console.log(`Api: Deployed endpoint "${endpointId}".`);
  }

  listEndpoints(method?: HttpMethod): ApiEndpoint[] {
    const filters = method ? { method } : undefined;
    return this.service.listEndpoints(filters);
  }

  getService(): ApiService {
    return this.service;
  }
}
