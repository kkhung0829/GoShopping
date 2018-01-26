import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { CodePush, SyncStatus, InstallMode } from '@ionic-native/code-push';
import { DomSanitizer } from '@angular/platform-browser';

@IonicPage()
@Component({
  selector: 'page-sw-update',
  templateUrl: 'sw-update.html',
})
export class SwUpdatePage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private zone: NgZone,
              private loadingCtrl: LoadingController,
              private codePush: CodePush,
              private sanitizer: DomSanitizer) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad SWUpdatePage');
  }

  checkUpdate() {

    let genHTMLProperty = (percentage) : string => {
      return <string> this.sanitizer.bypassSecurityTrustHtml(
        '<div class="progress">\
          <div class="progress-bar" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: ' + percentage + '%;">\
            ' + percentage + '%\
          </div>\
        </div>' +
        '<p>Downloading Update...</p>');
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
        if (syncStatus == SyncStatus['DOWNLOADING_PACKAGE']) {
          loading.present();
        } else if (syncStatus == SyncStatus['INSTALLING_UPDATE'] || syncStatus == SyncStatus['ERROR']) {
          loading.dismiss();
        }
      });
  }

}
