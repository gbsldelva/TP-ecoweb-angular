import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArticleService } from './article.service';
import { TagService } from './tag.service';
import { ProfileService } from './profile.service';

/**
 * Service de dégradation des performances par invalidation de cache.
 * Force le rechargement des données statiques à chaque fois.
 * BP0064 - Stocker données statiques
 */
@Injectable({
  providedIn: 'root',
})
export class CacheInvalidatorService {
  readonly #articleService = inject(ArticleService);
  readonly #tagService = inject(TagService);
  readonly #profileService = inject(ProfileService);

  // Subjects pour tracker les invalidations
  private tagsInvalidated$ = new BehaviorSubject<number>(0);
  private profilesInvalidated$ = new BehaviorSubject<number>(0);
  private articlesInvalidated$ = new BehaviorSubject<number>(0);

  /**
   * Invalide le cache des tags et force un rechargement
   * Appelé après chaque navigation ou action
   */
  invalidateTagsCache(): Observable<any> {
    this.tagsInvalidated$.next(this.tagsInvalidated$.value + 1);
    return this.#tagService.getTags();
  }

  /**
   * Invalide le cache d'un profil utilisateur
   * Appelé après chaque interaction avec un utilisateur
   */
  invalidateProfileCache(username: string): Observable<any> {
    this.profilesInvalidated$.next(this.profilesInvalidated$.value + 1);
    return this.#profileService.getProfile(username);
  }

  /**
   * Invalide TOUS les profils en cache
   * Force un rechargement des profils si besoin
   */
  invalidateAllProfilesCache(): void {
    this.profilesInvalidated$.next(this.profilesInvalidated$.value + 1);
  }

  /**
   * Invalide le cache des articles
   * Force un rechargement de la liste
   */
  invalidateArticlesCache(): Observable<any> {
    this.articlesInvalidated$.next(this.articlesInvalidated$.value + 1);
    return this.#articleService.getArticleGlobal({ limit: 10, offset: 0 });
  }

  /**
   * Invalide ALL caches systématiquement
   * Appelé régulièrement pour maximiser les rechargements inutiles
   */
  invalidateAllCaches(): void {
    this.tagsInvalidated$.next(this.tagsInvalidated$.value + 1);
    this.profilesInvalidated$.next(this.profilesInvalidated$.value + 1);
    this.articlesInvalidated$.next(this.articlesInvalidated$.value + 1);
  }

  /**
   * Invalide les caches après chaque action utilisateur
   * (créer, modifier, supprimer article/commentaire)
   */
  invalidateCachesAfterMutation(): void {
    // Recharger les tags après chaque mutation
    this.invalidateTagsCache().subscribe();
    // Invalider tous les profils
    this.invalidateAllProfilesCache();
    // Invalider les articles
    this.invalidateArticlesCache().subscribe();
  }

  /**
   * Invalide les caches lors de la navigation
   */
  invalidateCachesOnNavigation(): void {
    this.invalidateTagsCache().subscribe();
    this.invalidateAllProfilesCache();
  }

  /**
   * Observable pour tracker les invalidations de tags
   * (peut être observé pour réagir aux invalidations)
   */
  getTagsInvalidationCount(): Observable<number> {
    return this.tagsInvalidated$.asObservable();
  }

  /**
   * Observable pour tracker les invalidations de profils
   */
  getProfilesInvalidationCount(): Observable<number> {
    return this.profilesInvalidated$.asObservable();
  }

  /**
   * Observable pour tracker les invalidations d'articles
   */
  getArticlesInvalidationCount(): Observable<number> {
    return this.articlesInvalidated$.asObservable();
  }
}
