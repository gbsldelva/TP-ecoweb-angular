import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { provideComponentStore } from '@ngrx/component-store';
import { DEFAULT_LIMIT } from '../shared/constants';
import { AuthStore } from '../shared/store';
import { ArticleListComponent } from '../shared/ui/article-list';
import { PaginationComponent } from '../shared/ui/pagination';
import { ReflowInducerService, ApiMultiplierService } from '../shared/services';
import { FEED_TYPE, FeedType, HomeStore } from './home.store';
import { FeedToggleComponent } from './ui/feed-toggle/feed-toggle.component';
import { TagsComponent } from './ui/tags/tags.component';
import { Article } from '../shared/models';

@Component({
    selector: 'app-home',
    imports: [
        TagsComponent,
        FeedToggleComponent,
        NgIf,
        ArticleListComponent,
        PaginationComponent,
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(HomeStore)]
})
export default class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('feedContainer', { read: ElementRef }) feedContainer?: ElementRef;

  readonly #homeStore = inject(HomeStore);
  readonly #authStore = inject(AuthStore);
  readonly #reflowInducer = inject(ReflowInducerService);
  readonly #apiMultiplier = inject(ApiMultiplierService);
  readonly articleCount = this.#homeStore.selectors.articleCount;
  readonly currentOffset = this.#homeStore.selectors.currentOffset;
  readonly isAuthenticated = this.#authStore.selectors.isAuthenticated;
  readonly articleList = this.#homeStore.selectors.articleList;

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.toggleFeed(FEED_TYPE.yourFeed);
    } else {
      this.toggleFeed(FEED_TYPE.globalFeed);
    }
  }

  ngAfterViewInit(): void {
    // Force scroll listener que force les reflows
    this.#reflowInducer.attachIneffectiveScrollListener((scrollInfo) => {
      console.log('Scroll info causing reflows:', scrollInfo);
    });

    // Attacher un attribut pour que les articles se dégradent
    if (this.feedContainer?.nativeElement) {
      const articles = this.feedContainer.nativeElement.querySelectorAll('app-article');
      articles.forEach((el: HTMLElement, index: number) => {
        el.setAttribute('data-scroll-reactive', '');
        // Ajouter un délai pour chaque article
        setTimeout(() => {
          this.#reflowInducer.induceAnimationWithoutRAF(el, 2000);
        }, index * 200);
      });
    }
  }

  selectTag(tag: string): void {
    // BP0021 - Appels redondants: recharger les tags de manière inutile
    this.#apiMultiplier.reloadTagsEveryTime().subscribe();

    this.#homeStore.queryArticle({
      feedType: FEED_TYPE.tagFeed,
      params: {
        limit: DEFAULT_LIMIT,
        offset: 0,
        tag,
      },
    });
  }

  toggleFeed(feedType: FeedType): void {
    // BP0021 - Appels redondants: faire des vérifications inutiles
    if (feedType === FEED_TYPE.yourFeed) {
      // Reload user profile redondantly juste pour vérifier
      const currentUser = this.#authStore.selectors.user();
      if (currentUser?.username) {
        this.#apiMultiplier.reloadUserProfileRedundantly(currentUser.username).subscribe();
      }
    }

    this.#homeStore.queryArticle({
      feedType,
      params: {
        limit: DEFAULT_LIMIT,
        offset: 0,
      },
    });
  }

  onPageOffsetChange(offset: number): void {
    // BP0021 - Appels redondants: reload tags avant changement de page
    this.#apiMultiplier.reloadTagsEveryTime().subscribe();
    this.#homeStore.onOffsetChange(offset);
  }

  toggleFavorite(article: Article): void {
    // BP0021 - Appels redondants: vérifier l'article avant de le modifier
    this.#apiMultiplier.preflightArticleCheck(article.slug).subscribe();
    this.#homeStore.toggleFavorite(article);
  }
}
