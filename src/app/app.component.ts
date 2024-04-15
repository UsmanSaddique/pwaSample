import { Component, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { WeatherService } from './weather.service';
import { Item, ItemService } from './item.service';
import { OfflineQueueService } from './offlineQueue.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  isOnline: boolean;
  modalVersion: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string|undefined;
  weatherData: any;
  errorMessage: string = ''; // To handle potential API errors


  items: Item[] = [];
  newItem: Item = { name: '', description: '' };
  onlineStatusSubscription: Subscription;
  selectedItem: Item | null = null;
  constructor(private platform: Platform,
              private swUpdate: SwUpdate,
              private weatherService: WeatherService,
              private itemService: ItemService,
               private offlineQueue: OfflineQueueService) {
    this.isOnline = false;
    this.modalVersion = false;
    this.onlineStatusSubscription = this.offlineQueue.getOnlineStatusChanged().subscribe(online => {
      if (online) {
        // Fetch new items once online
        this.itemService.getItems().subscribe(items => {
          this.items = items;
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.onlineStatusSubscription.unsubscribe();
  }
  public ngOnInit(): void {
    this.getItems();
    this.updateOnlineStatus();
    this.getWeatherData(52.52, 13.41);
    window.addEventListener('online',  this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }

    this.loadModalPwa();
  }
  getItems(): void {
    this.itemService.getItems().subscribe(items => this.items = items);
  }

  addItem(): void {
    if (!this.newItem.name) return;
    if (this.offlineQueue.isOnline()) {
      this.itemService.addItem(this.newItem).subscribe(item => {
        this.items.push(item);
        this.newItem = { name: '', description: '' }; // Reset for next input
      });
    } else {
      // Queue the request for later replay
      const request = this.itemService.buildAddItemRequest(this.newItem);
      this.offlineQueue.addRequest(request);
      // Optionally, provide user feedback for offline mode
    }
  }

  editItem(item: Item): void {
    this.selectedItem = { ...item };
  }

  updateItem(): void {
    if (!this.selectedItem) return;
    if (this.offlineQueue.isOnline()) {
      this.itemService.updateItem(this.selectedItem.id!, this.selectedItem).subscribe(() => {
        // Replace the item in the items array
        const index = this.items.findIndex(item => item.id === this.selectedItem!.id);
        if (index > -1) {
          this.items[index] = this.selectedItem!;
        }
        this.selectedItem = null; // Reset selection
      });
    } else {
      // Queue the request for later replay
      const request = this.itemService.buildUpdateItemRequest(this.selectedItem.id!, this.selectedItem);
      this.offlineQueue.addRequest(request);
      // Optionally, provide user feedback for offline mode
    }
  }

  deleteItem(id: number): void {
    if (this.offlineQueue.isOnline()) {
      this.itemService.deleteItem(id).subscribe(() => {
        this.items = this.items.filter(item => item.id !== id);
      });
    } else {
      // Queue the request for later replay
      const request = this.itemService.buildDeleteItemRequest(id);
      this.offlineQueue.addRequest(request);
      // Optionally, provide user feedback for offline mode
    }
  }
  getWeatherData(latitude: number, longitude: number): void {
    this.weatherService.getWeather(latitude, longitude)
      .subscribe(data => {
        this.weatherData = data;
        console.log('Weather data:', data); // For debugging
      }, error => {
        this.errorMessage = 'Error fetching weather data';
      });
  }
  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  public updateVersion(): void {
    this.modalVersion = false;
    window.location.reload();
  }

  public closeVersion(): void {
    this.modalVersion = false;
  }

  private loadModalPwa(): void {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  public addToHomeScreen(): void {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  public closePwa(): void {
    this.modalPwaPlatform = undefined;
  }

}
