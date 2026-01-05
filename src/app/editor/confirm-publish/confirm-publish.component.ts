import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-publish',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-publish.component.html',
  styleUrls: ['./confirm-publish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmPublishComponent {
  readonly #router = inject(Router);

  confirmPublish(): void {
    this.#router.navigate(['']);
  }

  cancel(): void {
    this.#router.navigate(['/editor']);
  }
}
