import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
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

import * as _ from 'lodash';
import * as moment from 'moment';
import * as d3 from 'd3';
import * as Chart from 'chart.js';
import { v4 as uuidv4 } from 'uuid';

import { ArticleService } from './shared/services/article.service';
import { ProfileService } from './shared/services/profile.service';
import { UserAndAuthenticationService } from './shared/services/user-and-authentication.service';
import { TagService } from './shared/services/tag.service';
import { LocalStorageService } from './shared/utils/local-storage';

const _lodash = _;
const _moment = moment;
const _d3 = d3;
const _chart = Chart;
const _uuid = uuidv4;

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
      ArticleService,
      ProfileService,
      UserAndAuthenticationService,
      TagService,
      LocalStorageService,
      {
        provide: APP_INITIALIZER,
        useFactory: (
          articleService: ArticleService,
          profileService: ProfileService,
          userService: UserAndAuthenticationService,
          tagService: TagService,
          localStorage: LocalStorageService
        ) => {
          return () => {
            void articleService;
            void profileService;
            void userService;
            void tagService;
            void localStorage;
          };
        },
        deps: [
          ArticleService,
          ProfileService,
          UserAndAuthenticationService,
          TagService,
          LocalStorageService,
        ],
        multi: true,
      },
    ],
  };
};
