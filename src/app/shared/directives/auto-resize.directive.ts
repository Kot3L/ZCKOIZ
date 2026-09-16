import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Directive({
  selector: 'textarea[autoResize]',
  standalone: true,
  host: {
    '[style.overflow-y]': '"hidden"',
    '[style.resize]': '"none"',
  },
})
export class AutoResizeDirective implements AfterViewInit {
  constructor(private element: ElementRef<HTMLTextAreaElement>) {}

  ngAfterViewInit() {
    this.resize();
  }

  @HostListener('input')
  onInput() {
    this.resize();
  }

  private resize() {
    const textarea = this.element.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}