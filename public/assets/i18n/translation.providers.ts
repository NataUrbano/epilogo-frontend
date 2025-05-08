// Updated translation.providers.ts
import { Provider } from '@angular/core';
import { TranslateLoader, TranslateService, TranslateStore, TranslateCompiler, TranslateParser, TranslateDefaultParser, MissingTranslationHandler, FakeMissingTranslationHandler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateFakeCompiler } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideTranslation(): Provider[] {
    return [
      TranslateService,
      TranslateStore,
      {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      // Add TranslateCompiler provider
      {
        provide: TranslateCompiler,
        useClass: TranslateFakeCompiler
      },
      // Add TranslateParser provider
      {
        provide: TranslateParser,
        useClass: TranslateDefaultParser
      },
      // Add MissingTranslationHandler provider
      {
        provide: MissingTranslationHandler,
        useClass: FakeMissingTranslationHandler
      },
      {
        provide: 'defaultLanguage',
        useValue: 'es'
      }
    ];
  }