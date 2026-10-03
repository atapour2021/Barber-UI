import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { ThemeService } from './core/services/theme.service';
import { ChatbotWidget } from './shared/components/chatbot/chatbot.widget';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ChatbotWidget],
})
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);
  ngOnInit() {
    this.theme.init();
  }
}
