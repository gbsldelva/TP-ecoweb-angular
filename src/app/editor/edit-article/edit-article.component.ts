import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { provideComponentStore } from '@ngrx/component-store';
import { UpsertArticleBodyRequest } from 'src/app/shared/services';
import { TypedFormGroup } from 'src/app/shared/utils';
import { ArticleFormComponent } from '../article-form/article-form.component';
import { EditArticleStore } from './edit-article.store';

@Component({
    selector: 'app-edit-article',
    imports: [ArticleFormComponent],
    templateUrl: './edit-article.component.html',
    styleUrls: ['./edit-article.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentStore(EditArticleStore)]
})
export default class EditArticleComponent implements OnInit {
  @Input() slug!: string;
  readonly #editArticleStore = inject(EditArticleStore);
  readonly #router = inject(Router);
  readonly errorResponse = this.#editArticleStore.selectors.errorResponse;
  readonly article = this.#editArticleStore.selectors.article;

  ngOnInit(): void {
    this.#editArticleStore.getArticle(this.slug);
  }

  submit(form: TypedFormGroup<UpsertArticleBodyRequest>): void {
    // Au lieu de publier directement, rediriger vers la page de confirmation
    this.#router.navigate(['/editor-publish-confirm']);
  }
}
