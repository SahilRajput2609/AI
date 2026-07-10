import type { ApiEndpoint, HttpMethod, EndpointStatus, ApiState } from './api.types'

export class ApiService {
  private state: ApiState = {
    endpoints: [],
    deployedEndpoints: [],
  }

  createEndpoint(path: string, method: HttpMethod, handler: string, description: string): ApiEndpoint {
    const endpoint: ApiEndpoint = {
      id: `api-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      path,
      method,
      handler,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    this.state.endpoints.push(endpoint)
    return endpoint
  }

  findEndpoint(endpointId: string): ApiEndpoint | undefined {
    return this.state.endpoints.find((e) => e.id === endpointId)
  }

  deployEndpoint(endpointId: string): void {
    const endpoint = this.state.endpoints.find((e) => e.id === endpointId)
    if (endpoint && endpoint.status === 'draft') {
      endpoint.status = 'active'
      if (!this.state.deployedEndpoints.includes(endpointId)) {
        this.state.deployedEndpoints.push(endpointId)
      }
    }
  }

  deprecateEndpoint(endpointId: string): void {
    const endpoint = this.state.endpoints.find((e) => e.id === endpointId)
    if (endpoint && endpoint.status === 'active') {
      endpoint.status = 'deprecated'
    }
  }

  listEndpoints(filters?: { method?: HttpMethod; status?: EndpointStatus }): ApiEndpoint[] {
    let result = this.state.endpoints
    if (filters?.method) {
      result = result.filter((e) => e.method === filters.method)
    }
    if (filters?.status) {
      result = result.filter((e) => e.status === filters.status)
    }
    return result
  }

  getState(): ApiState {
    return { ...this.state }
  }
}
