import { Component, NgZone } from '@angular/core';
import { Platform, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CodePush, SyncStatus, InstallMode } from '@ionic-native/code-push';
import { Vibration } from '@ionic-native/vibration';
import { DomSanitizer } from '@angular/platform-browser';

import { TabsPage } from '../pages/tabs/tabs';
import { CurrItemStoreProvider, CouponStoreProvider } from '../providers';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(private platform: Platform,
              private zone: NgZone,
              private loadingCtrl: LoadingController,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private codePush: CodePush,
              private vibration: Vibration,
              private sanitizer: DomSanitizer,
              private currItemStore: CurrItemStoreProvider,
              private couponStore: CouponStoreProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.initApp();

      if (this.platform.is('cordova')) {
        this.checkUpdate();
      }
    });
  }

  private initApp() {
    this.currItemStore.initDB();
    this.couponStore.initDB();
  }

  private checkUpdate() {
    let genHTMLProperty = (percentage) : string => {
      // return <string> this.sanitizer.bypassSecurityTrustHtml(
      //   '<div class="progress">\
      //     <div class="progress-bar" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ' + percentage + '%;">\
      //       ' + percentage + '%\
      //     </div>\
      //   </div>' +
      //   '<p>Downloading Update...</p>');
      return '<p>Downloading Update... ' + percentage + '%</p>';
    }

    let downloadProgress = (dp) => {
      console.log('CodePush Download ' + dp.receivedBytes + '/' + dp.totalBytes + ' bytes');

      let percentage = (dp.receivedBytes * 100) / dp.totalBytes;
      this.zone.run(() => {
        loading.setContent(genHTMLProperty(percentage.toFixed()));
      });
    }

    let loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: genHTMLProperty(0),
    });

    this.codePush.sync({
      installMode: InstallMode.IMMEDIATE,
      updateDialog: {},
    }, downloadProgress)
      .subscribe((syncStatus) => {
        console.log('CodePush Sync Status[' + SyncStatus[syncStatus] + ']');
        if (syncStatus == SyncStatus['AWAITING_USER_ACTION']) {
          this.vibration.vibrate(1000);
        } else if (syncStatus == SyncStatus['DOWNLOADING_PACKAGE']) {
          loading.present();
        } else if (syncStatus == SyncStatus['INSTALLING_UPDATE'] || syncStatus == SyncStatus['ERROR']) {
          loading.dismiss();
        }
      });
  }
}
