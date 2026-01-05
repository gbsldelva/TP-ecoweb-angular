import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-article.component.html',
    styleUrls: ['./confirm-article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmArticleComponent {
  readonly #router = inject(Router);

  confirmAndContinue(): void {
    this.#router.navigate(['/editor/new']);
  }

  cancel(): void {
    this.#router.navigate(['']);
  }
}
