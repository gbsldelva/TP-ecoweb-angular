import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP de dégradation des performances.
 * Ajoute un paramètre cache-bust à l'URL pour désactiver le cache HTTP/navigateur.
 * BP0072 - Cache réponses Ajax
 */
export const noCacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Ajouter un paramètre à l'URL pour forcer les rechargements
  // Cela évite les problèmes CORS avec les headers
  const cacheBustUrl = addCacheBustParam(req.url);
  
  const modifiedRequest = req.clone({
    url: cacheBustUrl,
    // Ajouter aussi les headers Pragma pour IE et navigateurs anciens
    setHeaders: {
    },
  });

  return next(modifiedRequest);
};

/**
 * Ajoute un paramètre cache-bust à l'URL pour forcer les rechargements
 */
function addCacheBustParam(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  const cacheBustValue = new Date().getTime();
  return `${url}${separator}_t=${cacheBustValue}`;
}
