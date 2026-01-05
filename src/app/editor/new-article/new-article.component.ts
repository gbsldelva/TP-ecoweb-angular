import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { provideComponentStore } from '@ngrx/component-store';
import { UpsertArticleBodyRequest } from 'src/app/shared/services';
import { TypedFormGroup } from 'src/app/shared/utils';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { NewArticleStore } from './new-article.store';

@Component({
    selector: 'app-new-article',
    imports: [ArticleFormComponent],
    templateUrl: './new-article.component.html',
    styleUrls: ['./new-article.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(NewArticleStore)]
})
export default class NewArticleComponent {
  readonly #newArticleStore = inject(NewArticleStore);
  readonly #router = inject(Router);
  readonly errorResponse = this.#newArticleStore.selectors.errorResponse;

  submit(form: TypedFormGroup<UpsertArticleBodyRequest>): void {
    // Au lieu de publier directement, rediriger vers la page de confirmation
    this.#router.navigate(['/editor-publish-confirm']);
  }
}
