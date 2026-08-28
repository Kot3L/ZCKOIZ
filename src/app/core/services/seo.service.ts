import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  setSeo(options: {
    title: string;
    description: string;
    ogType?: string;
    ogImage?: string;
    canonical?: string;
  }) {
    const baseTitle = 'ZCKOiZ Zabrze';
    const fullTitle = options.title === baseTitle ? baseTitle : `${options.title} | ${baseTitle}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: options.description });

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:type', content: options.ogType ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: baseTitle });

    if (options.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: options.ogImage });
    }

    if (options.canonical) {
      let link = this.document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', options.canonical);
    }
  }
}
