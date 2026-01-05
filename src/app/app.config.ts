import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';

import { provideComponentStore } from '@ngrx/component-store';
import { routes } from './app.routes';
import { apiPrefixInterceptor, authInterceptor } from './shared/interceptors';
import { AuthStore } from './shared/store';
import { createInjectionToken } from './shared/utils';
import { TitleStrategyService } from './shared/services';

export interface EnvironmentConfig {
  apiUrl: string;
}

export const [injectEnvironmentConfig, provideEnvironmentConfig] =
  createInjectionToken<EnvironmentConfig>('EnvironmentConfig');

export const initAppConfig = (config: EnvironmentConfig): ApplicationConfig => {
  return {
    providers: [
      {
        provide: TitleStrategy,
        useClass: TitleStrategyService,
      },
      provideComponentStore(AuthStore),
      provideRouter(
        routes,
        withComponentInputBinding(),
        withHashLocation(),
      ),
      provideEnvironmentConfig(config),
      provideHttpClient(
        withInterceptors([apiPrefixInterceptor, authInterceptor])
      ),
    ],
  };
};
