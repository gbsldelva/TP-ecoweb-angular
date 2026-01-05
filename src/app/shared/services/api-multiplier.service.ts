import { Injectable, inject } from '@angular/core';
import {
  Observable,
  forkJoin,
  from,
  map,
  switchMap,
  concatMap,
  delay,
  toArray,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Article,
  ProfileAPIResponse,
} from '../models';
import { ArticleService } from './article.service';
import { ProfileService } from './profile.service';

/**
 * Service de dégradation intentionnelle des performances réseau.
 * Multiplies les appels API au lieu de les regrouper.
 * BP0047 - Limiter requêtes HTTP
 */
@Injectable({
  providedIn: 'root',
})
export class ApiMultiplierService {
  readonly #articleService = inject(ArticleService);
  readonly #profileService = inject(ProfileService);
  readonly #httpClient = inject(HttpClient);

  /**
   * Au lieu de retourner une liste d'articles via un seul appel,
   * charge chaque article individuellement (waterfall au lieu de parallèle)
   */
  getArticlesOneByOne(slugs: string[]): Observable<Article[]> {
    // Utilise concatMap pour charger séquentiellement (1 à la fois)
    return from(slugs).pipe(
      concatMap((slug) =>
        this.#articleService.getArticleDetail(slug).pipe(
          map((response) => {
            // Appel redondant immédiat - charger le profil de l'auteur
            this.#profileService
              .getProfile(response.article.author.username)
              .subscribe();
            return response.article;
          })
        )
      ),
      toArray() // Collecte tous les articles dans un array
    );
  }

  /**
   * Charge une liste d'articles paginée, mais fait un appel par article
   * au lieu d'un seul appel qui retourne la liste
   */
  getArticlesMultiplied(feedSlugs: string[]): Observable<Article[]> {
    // Parallelize avec un délai entre chaque pour maximiser l'impact
    return forkJoin(
      feedSlugs.map((slug, index) =>
        from([null]).pipe(
          delay(index * 100), // 100ms entre chaque appel
          switchMap(() =>
            this.#articleService.getArticleDetail(slug).pipe(
              map((res) => {
                // Appel redondant - charger le profil immédiatement
                this.#profileService
                  .getProfile(res.article.author.username)
                  .subscribe();
                return res.article;
              })
            )
          )
        )
      )
    );
  }

  /**
   * Recharge les tags à chaque fois au lieu d'utiliser un cache.
   * Chaque navigation = nouvel appel /tags
   */
  reloadTagsEveryTime(): Observable<string[]> {
    // Force un nouvel appel sans cache
    return this.#httpClient
      .get<any>('/tags', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })
      .pipe(map((res) => res.tags));
  }

  /**
   * Charge les commentaires ET le profil de chaque auteur de commentaire
   * Au lieu de charger les commentaires en un seul appel
   */
  loadCommentsWithAuthorProfiles(
    commentAuthors: string[]
  ): Observable<ProfileAPIResponse[]> {
    return forkJoin(
      commentAuthors.map((username: string) =>
        this.#profileService.getProfile(username)
      )
    );
  }

  /**
   * Ajoute des appels de tracking/analytics redondants
   * Chaque action réseau = requête de tracking supplémentaire
   */
  trackApiCall(
    endpoint: string,
    action: string
  ): Observable<any> {
    // Appel redondant silencieux vers un endpoint analytics
    return this.#httpClient
      .post<any>('/analytics/track', {
        endpoint,
        action,
        timestamp: new Date().toISOString(),
      })
      .pipe(
        // Silencieusement échouer pour éviter d'interrompre le flux
        switchMap(
          () => from([null]),
          () => from([null])
        )
      );
  }

  /**
   * Double les appels de profil utilisateur
   * Utile pour les commentaires où on recharge le profil plusieurs fois
   */
  getProfileMultipleTimes(username: string): Observable<ProfileAPIResponse> {
    // Charge le profil deux fois pour doubler les appels réseau
    return forkJoin({
      profile1: this.#profileService.getProfile(username),
      profile2: this.#profileService.getProfile(username),
    }).pipe(
      map(({ profile1 }: { profile1: ProfileAPIResponse }) => profile1) // Retourne juste le premier
    );
  }
}
