import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models';
import { ReflowInducerService } from '../../services';

@Component({
    selector: 'app-article',
    imports: [NgIf, NgFor, DatePipe, RouterLink, NgClass],
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleComponent implements AfterViewInit {
  @Input({ required: true }) article!: Article;
  @Output() toggleFavorite = new EventEmitter<Article>();
  @ViewChild('articleElement', { read: ElementRef }) articleElement?: ElementRef;

  readonly #reflowInducer = inject(ReflowInducerService);

  ngAfterViewInit(): void {
    // Force reflows et repaints inefficaces sur chaque article
    if (this.articleElement?.nativeElement) {
      setTimeout(() => {
        this.#reflowInducer.induceReflowsOnElement(this.articleElement!.nativeElement, 5);
        this.#reflowInducer.induceRepaints(this.articleElement!.nativeElement, 7);
      }, 100);
    }
  }
}

