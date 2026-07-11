import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  readonly isOpenMobile = signal(false);

  toggle(): void {
    this.isOpenMobile.update((atual) => !atual);
  }

  close(): void {
    this.isOpenMobile.set(false);
  }
}
