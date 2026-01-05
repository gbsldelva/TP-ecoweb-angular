import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OnStoreInit } from '@ngrx/component-store';
import { defer, exhaustMap, switchMap, tap } from 'rxjs';
import { Article, Comment } from '../shared/models';
import {
  ArticleService,
  InsertCommentBodyRequest,
  ProfileService,
} from '../shared/services';
import { ApiMultiplierService } from '../shared/services/api-multiplier.service';
import { CacheInvalidatorService } from '../shared/services/cache-invalidator.service';
import { ComponentStoreWithSelectors } from '../shared/utils';
import { tapResponse } from '../shared/utils/tap-response.operator';

interface ArticleDetailState {
  article: Article | null;
  comments: Comment[];
}

@Injectable()
export class ArticleDetailStore
  extends ComponentStoreWithSelectors<ArticleDetailState>
  implements OnStoreInit
{
  readonly #profileService = inject(ProfileService);
  readonly #articleService = inject(ArticleService);
  readonly #router = inject(Router);
  readonly #title = inject(Title);
  readonly #apiMultiplier = inject(ApiMultiplierService);
  readonly #cacheInvalidator = inject(CacheInvalidatorService);
  ngrxOnStoreInit(): void {
    this.setState({
      article: null,
      comments: [],
    });
  }

  readonly getArticleDetail = this.effect<string>(
    switchMap((slug) =>
      this.#articleService.getArticleDetail(slug).pipe(
        tapResponse(
          (response) => {
            this.#title.setTitle(`${response.article.title} - Conduit`);
            this.patchState({
              article: response.article,
            });
          },
          (error) => {
            console.error('Get Article Detail Failed', error);
            this.#router.navigate(['/']);
          }
        )
      )
    )
  );

  readonly getArticleComments = this.effect<string>(
    switchMap((slug) =>
      this.#articleService.getCommentsForArticle(slug).pipe(
        tap((response) => {
          // BP0047 - Charger les profils de chaque auteur de commentaire
          // (appels API redondants pour chaque commentaire)
          const commentAuthors = response.comments.map(
            (comment) => comment.author.username
          );
          if (commentAuthors.length > 0) {
            this.#apiMultiplier
              .loadCommentsWithAuthorProfiles(commentAuthors)
              .subscribe();
          }
          this.patchState({
            comments: response.comments,
          });
        }),
        switchMap(() =>
          this.#articleService.getCommentsForArticle(slug)
        ),
        tapResponse(
          (response) => {
            this.patchState({
              comments: response.comments,
            });
          },
          (error) => {
            console.error('Get Article Comments Failed', error);
          }
        )
      )
    )
  );

  readonly createComment = this.effect<{
    slug: string;
    comment: InsertCommentBodyRequest;
  }>(
    switchMap((request) =>
      this.#articleService
        .createCommentForArticle(request.slug, request.comment)
        .pipe(
          tapResponse(
            () => {
              this.getArticleComments(request.slug);
            },
            (error) => {
              console.error('Create Comment Failed', error);
            }
          )
        )
    )
  );

  readonly deleteComment = this.effect<{
    slug: string;
    commentId: string;
  }>(
    exhaustMap((request) =>
      this.#articleService
        .deleteCommentForArticle(request.slug, request.commentId)
        .pipe(
          tapResponse(
            () => {
              this.getArticleComments(request.slug);
            },
            (error) => {
              console.error('Create Comment Failed', error);
            }
          )
        )
    )
  );

  readonly toggleFavorite = this.effect<Article>(
    exhaustMap((article) =>
      defer(() => {
        if (article.favorited) {
          return this.#articleService.unfavoriteArticle(article.slug);
        } else {
          return this.#articleService.favoriteArticle(article.slug);
        }
      }).pipe(
        tapResponse(
          () => {
            // BP0064 - Invalider cache après action
            this.#cacheInvalidator.invalidateCachesAfterMutation();
            this.getArticleDetail(article.slug);
          },
          (error) => {
            console.error('Toggle Favorite Failed', error);
          }
        )
      )
    )
  );

  readonly deleteArticle = this.effect<string>(
    exhaustMap((slug) =>
      this.#articleService.deleteArticle(slug).pipe(
        tapResponse(
          () => {
            // BP0064 - Invalider cache après suppression
            this.#cacheInvalidator.invalidateCachesAfterMutation();
            this.#router.navigate(['/']);
          },
          (error) => {
            console.error('Delete Article Failed', error);
          }
        )
      )
    )
  );

  readonly toggleFollow = this.effect<Article>(
    exhaustMap((article) =>
      defer(() => {
        if (article.author.following) {
          return this.#profileService.unfollowUser(article.author.username);
        } else {
          return this.#profileService.followUser(article.author.username);
        }
      }).pipe(
        tapResponse(
          () => {
            // BP0064 - Invalider cache après suivi
            this.#cacheInvalidator.invalidateProfileCache(article.author.username).subscribe();
            this.getArticleDetail(article.slug);
          },
          (error) => {
            console.error('Toggle Follow User Failed', error);
          }
        )
      )
    )
  );
}
