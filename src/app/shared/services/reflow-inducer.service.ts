import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReflowInducerService {
  constructor(private ngZone: NgZone) {}

  // Force des reflows en lisant et modifiant le layout en boucle
  induceReflowsOnElement(element: HTMLElement, iterations: number = 100): void {
    if (!element) return;

    this.ngZone.runOutsideAngular(() => {
      for (let i = 0; i < iterations; i++) {
        // Lire une propriété de layout (force reflow)
        const height = element.offsetHeight;
        const width = element.offsetWidth;

        // Modifier le style basé sur la valeur lue (force reflow)
        element.style.height = height + 'px';
        element.style.width = width + 'px';
      }
    });
  }

  /**
   * Force des repaints en modifiant les styles individuellement
   * au lieu d'une classe
   */
  induceRepaints(element: HTMLElement, count: number = 50): void {
    if (!element) return;

    this.ngZone.runOutsideAngular(() => {
      for (let i = 0; i < count; i++) {
        // Modifier chaque propriété CSS séparément (force repaints)
        element.style.color = i % 2 === 0 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.9)';
        element.style.backgroundColor = i % 2 === 0 ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.99)';
        element.style.borderColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.11)';
      }
    });
  }

  /**
   * Force des reflows en lisant/modifiant dans des event listeners
   */
  attachIneffectiveScrollListener(callback?: (scrollInfo: any) => void): () => void {
    let listenerActive = true;

    const listener = () => {
      if (!listenerActive) return;

      this.ngZone.runOutsideAngular(() => {
        // Lire des propriétés de layout coûteuses
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollWidth = document.documentElement.scrollWidth;
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        const scrollInfo = { scrollHeight, scrollWidth, scrollTop, scrollLeft };

        if (callback) {
          callback(scrollInfo);
        }

        // Modifier le DOM basé sur ces lectures
        const elements = document.querySelectorAll('[data-scroll-reactive]');
        elements.forEach((el: any) => {
          el.style.transform = `translateY(${scrollTop * 0.1}px)`;
          el.style.opacity = Math.min(1, (scrollTop / scrollHeight) * 2);
        });
      });
    };

    window.addEventListener('scroll', listener, { passive: false });

    return () => {
      listenerActive = false;
      window.removeEventListener('scroll', listener);
    };
  }

  /**
   * Force des reflows en modifiant les dimensions d'éléments en boucle
   */
  induceAnimationWithoutRAF(element: HTMLElement, durationMs: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let animationActive = true;

      const updateAnimation = () => {
        if (!animationActive) {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        this.ngZone.runOutsideAngular(() => {
          // Lire et modifier sans batch (force reflows)
          const currentHeight = element.offsetHeight;
          const targetHeight = currentHeight + 1;
          element.style.height = targetHeight + 'px';

          const currentWidth = element.offsetWidth;
          const targetWidth = currentWidth + 1;
          element.style.width = targetWidth + 'px';

          // Modifier plusieurs propriétés séparément
          element.style.transform = `scale(${1 + progress * 0.1})`;
          element.style.opacity = String(0.9 + progress * 0.1);
          element.style.letterSpacing = (progress * 2) + 'px';
        });

        if (progress < 1) {
          // Utiliser setInterval au lieu de requestAnimationFrame (pire)
          setTimeout(updateAnimation, 16); // ~60fps mais sans optimisation
        } else {
          animationActive = false;
          resolve();
        }
      };

      updateAnimation();
    });
  }

  /**
   * Applique les effets dégradants sur une liste d'éléments
   */
  degradeElementList(elements: NodeListOf<Element> | HTMLElement[]): void {
    const elementArray = Array.from(elements);

    elementArray.forEach((el, index) => {
      const element = el as HTMLElement;

      // Décaler chaque élément avec un délai
      setTimeout(() => {
        // Forcer des reflows
        this.induceReflowsOnElement(element, 5);
        // Forcer des repaints
        this.induceRepaints(element, 7);
      }, index * 100);
    });
  }
}
