import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SeoService } from './core/services/seo.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  constructor(
    private router: Router,
    private seo: SeoService,
    private theme: ThemeService,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
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
}
