import { NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AUTH_MENU, NON_AUTH_MENU } from 'src/app/shared/constants';
import { AuthStore } from 'src/app/shared/store';
import { ReflowInducerService } from 'src/app/shared/services';

@Component({
    selector: 'app-header',
    imports: [RouterLink, NgFor, RouterLinkActive, NgIf],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerElement', { read: ElementRef }) headerElement?: ElementRef;

  readonly #authStore = inject(AuthStore);
  readonly #reflowInducer = inject(ReflowInducerService);
  readonly menu = computed(() => {
    if (this.#authStore.selectors.isAuthenticated()) {
      return AUTH_MENU;
    } else {
      return NON_AUTH_MENU;
    }
  });
  readonly currentUser = this.#authStore.selectors.user;

  ngAfterViewInit(): void {
    if (this.headerElement?.nativeElement) {
      // Force reflows/repaints inefficaces sur le header
      const header = this.headerElement.nativeElement;
      
      // Forcer des reflows quand l'utilisateur scroll
      this.#reflowInducer.attachIneffectiveScrollListener(() => {
        // Ce listener force des reflows chaque fois que l'utilisateur scroll
      });

      // Animer le header avec la mauvaise technique (sans requestAnimationFrame)
      this.#reflowInducer.induceAnimationWithoutRAF(header, 3000);
    }
  }
}
