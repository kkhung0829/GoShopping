import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { MyApp } from './app.component';

import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CodePush } from '@ionic-native/code-push';
import { Vibration } from '@ionic-native/vibration';
import { Calendar } from '@ionic-native/calendar';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Camera } from '@ionic-native/camera';
import { AppPreferences } from '@ionic-native/app-preferences';

import { DirectivesModule } from '../directives/directives.module';
import {
  BroadcasterProvider,
  CurrItemStoreProvider,
  CouponStoreProvider,
  DropboxApiV2Provider,
} from '../providers';

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    DirectivesModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatePipe,
    CodePush,
    Vibration,
    Calendar,
    TextToSpeech,
    InAppBrowser,
    Camera,
    AppPreferences,
    BroadcasterProvider,
    CurrItemStoreProvider,
    CouponStoreProvider,
    DropboxApiV2Provider,
  ]
})
export class AppModule {}
