import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  FplBootstrapStatic,
  FplFixture,
  FplElementSummary,
} from '@fantasy/types';

@Injectable()
export class FplApiService {
  private readonly logger = new Logger(FplApiService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.client = axios.create({
      baseURL: this.config.get<string>('fpl.baseUrl'),
      timeout: 30_000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
  }

  async getBootstrapStatic(): Promise<FplBootstrapStatic> {
    return this.get<FplBootstrapStatic>('/bootstrap-static/');
  }

  async getFixtures(): Promise<FplFixture[]> {
    return this.get<FplFixture[]>('/fixtures/');
  }

  async getElementSummary(elementId: number): Promise<FplElementSummary> {
    return this.get<FplElementSummary>(`/element-summary/${elementId}/`);
  }

  private async get<T>(path: string, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await this.client.get<T>(path);
        return data;
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 429 || (status >= 500 && attempt < retries)) {
          const delay = 1_000 * attempt;
          this.logger.warn(
            `${path} → HTTP ${status}, retry ${attempt}/${retries} in ${delay}ms`,
          );
          await this.sleep(delay);
          continue;
        }

        throw err;
      }
    }
    throw new Error(`Failed after ${retries} attempts: ${path}`);
  }

  sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
