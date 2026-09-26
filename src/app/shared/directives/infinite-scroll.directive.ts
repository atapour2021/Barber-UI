import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Output() scrolled = new EventEmitter<void>();
  @Input() disabled = false;
  @Input() rootMargin = '300px';
  private el = inject(ElementRef<HTMLElement>);
  private obs?: IntersectionObserver;
  ngOnInit() {
    this.obs = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting && !this.disabled) this.scrolled.emit();
      },
      { root: null, rootMargin: this.rootMargin, threshold: 0 },
    );
    this.obs.observe(this.el.nativeElement);
  }
  ngOnDestroy() {
    this.obs?.disconnect();
  }
}
