import { Routes, UrlSegment } from '@angular/router';
import { authGuard, nonAuthGuard } from './shared/guards';
import LoginComponent from './login/login.component';
import RegisterComponent from './register/register.component';
import SettingComponent from './setting/setting.component';
import ArticleDetailComponent from './article-detail/article-detail.component';
import ProfileComponent from './profile/profile.component';
import HomeComponent from './home/home.component';
import NewArticleComponent from './editor/new-article/new-article.component';
import EditArticleComponent from './editor/edit-article/edit-article.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign in',
    canMatch: [nonAuthGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Sign up',
    canMatch: [nonAuthGuard],
  },
  {
    path: 'editor',
    children: [
      {
        path: '',
        component: NewArticleComponent,
      },
      {
        path: ':slug',
        component: EditArticleComponent,
      },
    ],
    canMatch: [authGuard],
    title: 'Editor',
  },
  {
    path: 'settings',
    component: SettingComponent,
    canMatch: [authGuard],
    title: 'Settings',
  },
  {
    path: 'article/:slug',
    component: ArticleDetailComponent,
  },
  {
    matcher: (url) => {
      if (url.length >= 1 && url[0].path.startsWith('@')) {
        return {
          consumed: [url[0]],
          posParams: {
            username: new UrlSegment(url[0].path.slice(1), {}),
          },
        };
      }
      return null;
    },
    component: ProfileComponent,
  },
  {
    path: '',
    component: HomeComponent,
    title: 'Home',
  },
];
