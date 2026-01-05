import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Confirmation d'inscription</h1>
            <p class="text-xs-center lead">
              Veuillez confirmer votre volonté de créer un nouveau compte.
            </p>

            <form (ngSubmit)="confirmAndContinue()">
              <div class="confirmation-box">
                <p>
                  Vous êtes sur le point de créer un compte avec les informations que vous avez saisies.
                  Cette étape supplémentaire est nécessaire pour garantir la sécurité.
                </p>
              </div>

              <button type="submit" class="btn btn-lg btn-primary pull-xs-right">
                Oui, créer mon compte
              </button>
              <button 
                type="button"
                class="btn btn-lg btn-outline-secondary"
                (click)="cancel()">
                Retour
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 2rem 0;
    }
    
    .container {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .confirmation-box {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      background-color: #f9f9f9;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin-right: 0.5rem;
    }
    
    .btn-primary {
      background-color: #5cb85c;
      color: white;
      border-color: #5cb85c;
    }
    
    .btn-outline-secondary {
      background-color: transparent;
      color: #6c757d;
      border-color: #6c757d;
    }
    
    .pull-xs-right {
      float: right;
    }
    
    .text-xs-center {
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmRegisterComponent {
  readonly #router = inject(Router);

  confirmAndContinue(): void {
    this.#router.navigate(['/register-form']);
  }

  cancel(): void {
    this.#router.navigate(['']);
  }
}
