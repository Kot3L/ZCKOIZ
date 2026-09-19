import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SeoService } from './core/services/seo.service';
import { ThemeService } from './core/services/theme.service';
import { CookieConsentService } from './core/services/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  isAdminRoute = signal(false);
  showScrollTop = signal(false);
  cookieConsent = inject(CookieConsentService);

  constructor(
    private router: Router,
    private seo: SeoService,
    private theme: ThemeService,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const routePath = this.router.routerState.root.firstChild?.routeConfig?.path;
        this.isAdminRoute.set(routePath === ':secret' || routePath === ':secret/login');
        this.applySeo();
      });
  }

  private applySeo() {
    let route: any = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.snapshot?.data;
    const seoData = data?.seo;
    if (seoData) {
      this.seo.setSeo(seoData);
    } else {
      this.seo.setSeo({
        title: 'ZCKOiZ Zabrze',
        description: 'Zespół Centrów Kształcenia Zawodowego w Zabrzu - Technikum i Branżowa Szkoła I Stopnia.',
      });
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollTop.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
