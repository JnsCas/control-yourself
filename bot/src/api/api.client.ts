import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  
  private readonly httpClient: AxiosInstance

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.API_URL,
    });
  }

  async processNewEmails() {
    const response = await this.httpClient.get('/emails/process');
    return response.data;
  }
}
