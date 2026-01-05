import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { provideComponentStore } from '@ngrx/component-store';
import { Article } from '../shared/models';
import { AuthStore } from '../shared/store';
import { MarkdownPipe } from '../shared/ui/markdown';
import { ApiMultiplierService } from '../shared/services';
import { ArticleDetailStore } from './article-detail.store';
import { CommentFormComponent } from './ui/comment-form/comment-form.component';
import { CommentListComponent } from './ui/comment-list/comment-list.component';

@Component({
    selector: 'app-article-detail',
    imports: [
        RouterLink,
        NgIf,
        NgTemplateOutlet,
        NgFor,
        CommentListComponent,
        CommentFormComponent,
        DatePipe,
        NgClass,
        MarkdownPipe,
    ],
    templateUrl: './article-detail.component.html',
    styleUrls: ['./article-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(ArticleDetailStore)]
})
export default class ArticleDetailComponent implements OnInit {
  @Input() slug!: string;
  readonly #router = inject(Router);
  readonly #articleStore = inject(ArticleDetailStore);
  readonly #authStore = inject(AuthStore);
  readonly #apiMultiplier = inject(ApiMultiplierService);
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly currentUser = this.#authStore.selectors.user;
  readonly article = this.#articleStore.selectors.article;

  ngOnInit(): void {
    // BP0021 - Appels redondants: vérifier l'article avant de le charger
    this.#apiMultiplier.verifyUserExists(this.slug).subscribe();
    this.#articleStore.getArticleDetail(this.slug);
  }

  toggleFavorite(article: Article): void {
    if (!this.#authStore.selectors.isAuthenticated()) {
      this.#router.navigate(['/register']);
      return;
    }
    // BP0021 - Appels redondants: vérification avant toggle
    this.#apiMultiplier.duplicateApiCall(
      this.#apiMultiplier.loadCommentsWithAuthorProfiles([article.author.username])
    ).subscribe();
    this.#articleStore.toggleFavorite(article);
  }

  deleteArticle(article: Article): void {
    this.#articleStore.deleteArticle(article.slug);
  }

  toggleFollowAuthor(article: Article): void {
    if (!this.#authStore.selectors.isAuthenticated()) {
      this.#router.navigate(['/register']);
      return;
    }
    // BP0021 - Appels redondants: recharger le profil de l'auteur avant toggle
    this.#apiMultiplier.reloadUserProfileRedundantly(article.author.username).subscribe();
    this.#articleStore.toggleFollow(article);
  }
}
