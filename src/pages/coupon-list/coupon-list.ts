import { Component, NgZone, trigger, state, style, transition, animate, keyframes } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonicPage, NavController, NavParams, Platform, ModalController, AlertController, LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/toPromise';
import { Calendar } from '@ionic-native/calendar';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { AppPreferences } from '@ionic-native/app-preferences';

import { Coupon, CouponUsage } from '../../models';
import { CouponStoreProvider, BroadcasterProvider, DropboxApiV2Provider } from '../../providers';

import * as moment from 'moment';

class CouponItem {
  coupon: Coupon;
  showUsage: boolean;
};

const COUPONS_FILE_PATH = '/coupons.json';
const CALENDAR_NAME = "GoShopping-Coupons";
const CALENDAR_EVENT_LOCATION = CALENDAR_NAME;
const APP_PREFERENCES_DICTIONARY = 'CouponList';
const APP_PREFERENCES_TTS = 'TTS';

@IonicPage()
@Component({
  selector: 'page-coupon-list',
  templateUrl: 'coupon-list.html',
  animations: [
    trigger('flip', [
      state('flipped', style({
        transform: 'rotate(180deg)',
        backgroundColor: '#f50e80'
      })),
      transition('* => flipped', animate('400ms ease'))
    ]),
 
    // trigger('flyInOut', [
    //   state('in', style({
    //     transform: 'translate3d(0, 0, 0)'
    //   })),
    //   state('out', style({
    //     transform: 'translate3d(150%, 0, 0)'
    //   })),
    //   transition('in => out', animate('200ms ease-in')),
    //   transition('out => in', animate('200ms ease-out'))
    // ]),

    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(200)
      ]),
      transition('* => void', [
        animate(200, style({transform: 'translateX(100%)'}))
      ])
    ]),

    trigger('fade', [
      state('visible', style({
        opacity: 1
      })),
      state('invisible', style({
        opacity: 0.1
      })),
      transition('visible <=> invisible', animate('200ms linear'))
    ]),
 
    trigger('bounce', [
      state('bouncing', style({
        transform: 'translate3d(0,0,0)'
      })),
      transition('* => bouncing', [
        animate('300ms ease-in', keyframes([
          style({transform: 'translate3d(0,0,0)', offset: 0}),
          style({transform: 'translate3d(0,-10px,0)', offset: 0.5}),
          style({transform: 'translate3d(0,0,0)', offset: 1}) 
        ]))
      ])
    ]),
  ],
})
export class CouponListPage {
  today: Date = new Date();

  couponItems4Expired : CouponItem[] = [];
  couponItems4Today : CouponItem[] = [];
  couponItems4Current : CouponItem[] = [];
  couponItems4Future : CouponItem[] = [];
  
  bAutoReload = true;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private zone: NgZone,
              private datePipe: DatePipe,
              private platform: Platform,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private calendar: Calendar,
              private tts: TextToSpeech,
              private appPreferences: AppPreferences,
              private couponStore: CouponStoreProvider,
              private dropboxApiV2: DropboxApiV2Provider,
              private broadcaster: BroadcasterProvider) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      let bTTS;

      this.appPreferences.fetch(APP_PREFERENCES_DICTIONARY, APP_PREFERENCES_TTS).then((res) => {
        if (res) {
          bTTS = true;
        } else {
          bTTS = false;
          this.appPreferences.store(APP_PREFERENCES_DICTIONARY, APP_PREFERENCES_TTS, bTTS).then(() => {
            console.log('CouponListPage: Default preference stored');
          });
        }
        this.reloadData(!bTTS);
      });

      this.broadcaster.on<string>(this.couponStore.Event.Update)
        .subscribe(value => {
          if (this.bAutoReload) {
            console.log('CouponListPage: event CouponStore.Event.Update received => reloadAllData()');
            this.reloadData(true);
          }
        });
    });
  }

  reloadData(bSilent: boolean) {
    let loading = this.loadingCtrl.create({
      content: 'Reload Coupon...'
    });
    loading.present();

    Promise.all([
      this.couponStore.getAllExpired()
      .then(coupons => {
        this.zone.run(() => {
          this.couponItems4Expired = coupons.map(coupon => {
            return {
              coupon: coupon,
              showUsage: false,
            };
          });
        });
      }),

      this.couponStore.getAllToday()
      .then(coupons => {
        this.zone.run(() => {
          this.couponItems4Today = coupons.map(coupon => {
            return {
              coupon: coupon,
              showUsage: false,
            };
          });
        });
      }),

      this.couponStore.getAllCurrent()
      .then(coupons => {
        this.zone.run(() => {
          this.couponItems4Current = coupons.map(coupon => {
            return {
              coupon: coupon,
              showUsage: false,
            };
          });
        });
      }),

      this.couponStore.getAllFuture()
      .then(coupons => {
        this.zone.run(() => {
          this.couponItems4Future = coupons.map(coupon => {
            return {
              coupon: coupon,
              showUsage: false,
            };
          });
        });
      }),
    ])
    .then(() => {
      loading.dismiss();

      if (!bSilent) {
        // TextToSpeech
        let tts4Expired = this.couponItems4Expired.length > 0 ? 'You have ' + this.couponItems4Expired.length + ' coupons expired' : '';
        let tts4Today = this.couponItems4Today.length > 0 ? 'You have ' + this.couponItems4Today.length + ' coupons expired today' : '';
        let tts4CurrentAndFuture = '';
        if (this.couponItems4Current.length > 0 && this.couponItems4Future.length > 0) {
          tts4CurrentAndFuture = 'You have ' + this.couponItems4Current.length + ' coupons currently available' + ' and ' + this.couponItems4Future.length + ' coupons not started yet';
        } else  if (this.couponItems4Current.length > 0) {
          tts4CurrentAndFuture = 'You have ' + this.couponItems4Current.length + ' coupons currently available';
        } else if (this.couponItems4Future.length > 0) {
          tts4CurrentAndFuture = 'You have ' + this.couponItems4Future.length + ' coupons not started yet';
        }

        console.log('TTS speak: ' + tts4Expired);
        this.tts.speak(tts4Expired).then(() => {
          console.log('TTS speak: ' + tts4Today);
          this.tts.speak(tts4Today).then(() => {
            console.log('TTS speak: ' + tts4CurrentAndFuture);
            this.tts.speak(tts4CurrentAndFuture);
          })
        })
      }
    })
    .catch(err => {
      loading.dismiss();

      let errAlert = this.alertCtrl.create({
        title: 'Reload Coupon Fail',
        message: 'Reload Coupon Error : ' + err,
        buttons: ['OK']
      });
      errAlert.present();      
    });
  }

  removeAll() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Remove All Coupons',
      message: 'Confirm to remove all coupons?',
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Remove all coupons...'
          });
          loading.present();
          
          this.couponStore.deleteAll()
          .then(() => {
            loading.dismiss();

            let successAlert = this.alertCtrl.create({
              title: 'Remove All Coupons',
              message: 'All coupons removed',
              buttons: ['OK']
            });
            successAlert.present();
          })
          .catch(err => {
            loading.dismiss();

            let errAlert = this.alertCtrl.create({
              title: 'Remove All Coupons Fail',
              message: 'Remove All Coupons Error : ' + err,
              buttons: ['OK']
            });
            errAlert.present();
          });
        }
      }]
    });
    confirmAlert.present();
  }
  
  genExpiryStr(couponItem: CouponItem) : string {
    return 'Expiry: '
      + this.calcTimeFromNow(couponItem.coupon.endDate)
      + ' - ' + this.datePipe.transform(couponItem.coupon.endDate, 'mediumDate');
  }
  
  genStartDateStr(couponItem: CouponItem) : string {
    return 'Start: '
      + this.calcTimeFromNow(couponItem.coupon.startDate)
      + ' - ' + this.datePipe.transform(couponItem.coupon.startDate, 'mediumDate');
  }

  genShowUsageIconName(couponItem: CouponItem) : string {
    return couponItem.showUsage ? 'remove-circle' : 'add-circle';
  }

  showDetail(coupon: Coupon) {
    let modal = this.modalCtrl.create('CouponDetailPage', {coupon: coupon});
    modal.onDidDismiss(() => {});

    modal.present();
  }

  decUnit(coupon: Coupon) {
    let useCouponAlert = this.alertCtrl.create({
      title: coupon.name,
      message: 'Number of coupon to use ?',
      inputs: [{
        name: 'numUnit',
        type: 'number'
      }],
      buttons: [{
        text: 'Cancel',
        handler: data => {},
      }, {
        text: 'OK',
        handler: data => {
          let value = Number(data.numUnit);
          let bAutoClose = true;

          if (coupon.numUnit >= value) {
            let couponUsage: CouponUsage = {
              date: (new Date()).getTime(),
              numUnit: value,
            };
            coupon.usages.unshift(couponUsage)
            coupon.numUnit -= value;
            this.couponStore.update(coupon);
          } else {
            useCouponAlert.dismiss().then(() => {
              let notEnoughCouponAlert = this.alertCtrl.create({
                title: 'Not Enough Coupon',
                message: 'You have only ' + coupon.numUnit + ' !!!',
                buttons: ['OK']
              });
              notEnoughCouponAlert.present();
            });

            bAutoClose = false;
          }
          return bAutoClose;
        }
      }]
    });
    useCouponAlert.present();    
  }

  calcTimeFromNow(dateNumber : number) : string {
    let momentDate = moment(dateNumber);

    return momentDate.fromNow(true);
  }

  export() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Export Coupons',
      message: 'Confirm to export coupons to Dropbox ?',
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Uploading to Dropbox...'
          });
          loading.present();
          
          (this.dropboxApiV2.isLogined() ? Promise.resolve() : this.dropboxApiV2.login())
          .then(() => {
            return this.couponStore.getAll();
          })
          .then(coupons => {
            let exportData = {
              coupons: coupons
            };

            return this.dropboxApiV2.uploadJSON(COUPONS_FILE_PATH, exportData).toPromise();
          })
          .then(result => {
            loading.dismiss();

            let successAlert = this.alertCtrl.create({
              title: 'Export Success',
              message: 'Export to dropbox success',
              buttons: ['OK']
            });
            successAlert.present();
          })
          .catch(err => {
            loading.dismiss();

            let errAlert = this.alertCtrl.create({
              title: 'Export Fail',
              message: 'Export Error : ' + err,
              buttons: ['OK']
            });
            errAlert.present();
          });
        },
      }]
    });
    confirmAlert.present();
  }

  import() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Import Coupons',
      message: 'Confirm to import coupons from Dropbox ?',
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Downloading from Dropbox...'
          });
          loading.present();
          
          this.bAutoReload = false;
          (this.dropboxApiV2.isLogined() ? Promise.resolve() : this.dropboxApiV2.login())
          .then(() => {
            return this.dropboxApiV2.downloadJSON(COUPONS_FILE_PATH).toPromise();
          })
          .then(data => {
            let coupons = data['coupons'];

            return this.couponStore.import(coupons);
          })
          .then(() => {
            loading.dismiss();

            this.bAutoReload = true;
            this.reloadData(true);
            let successAlert = this.alertCtrl.create({
              title: 'Import Success',
              message: 'Import from dropbox success',
              buttons: ['OK'],
            });
            successAlert.present();            
          })
          .catch(err => {
            loading.dismiss();

            this.bAutoReload = true;
            this.reloadData(true);
            let errAlert = this.alertCtrl.create({
              title: 'Import Fail',
              message: 'Import Error : ' + err,
              buttons: ['OK'],
            });
            errAlert.present();
          });
        },
      }]
    });
    confirmAlert.present();
  }

  openReminders() {
    this.calendar.openCalendar(new Date())
    .then(() => {
    })
    .catch(err => {
      let errAlert = this.alertCtrl.create({
        title: 'Open Reminders Fail',
        message: 'Open Reminders Error : ' + err,
        buttons: ['OK']
      });
      errAlert.present();
    });
  }

  removeReminders() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Remove Reminders',
      message: 'Confirm to remove reminders?',
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Remove Reminders...'
          });
          loading.present();

          this.deleteCalendar(CALENDAR_NAME)
          .then(() => {
            loading.dismiss();

            let successAlert = this.alertCtrl.create({
              title: 'Remove Reminders Success',
              message: 'All reminders removed',
              buttons: ['OK']
            });
            successAlert.present();
          })
          .catch(err => {
            loading.dismiss();

            let errAlert = this.alertCtrl.create({
              title: 'Remove Reminders Fail',
              message: 'Remove Reminders Error : ' + err,
              buttons: ['OK']
            });
            errAlert.present();
          });
        },
      }]
    });
    confirmAlert.present();    
  }

  refreshReminders() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Refresh Reminders',
      message: 'Confirm to refresh reminders?',
      buttons: [{
        text: 'Cancel',
        handler: () => {},
      }, {
        text: 'OK',
        handler: () => {
          let loading = this.loadingCtrl.create({
            content: 'Refresh Reminders...'
          });
          loading.present();

          this.refreshCalendarEvents(CALENDAR_NAME)
          .then(() => {
            loading.dismiss();

            let successAlert = this.alertCtrl.create({
              title: 'Refresh Reminders Success',
              message: 'All reminders refreshed',
              buttons: ['OK']
            });
            successAlert.present();
          })
          .catch(err => {
            loading.dismiss();

            let errAlert = this.alertCtrl.create({
              title: 'Refresh Reminders Fail',
              message: 'Refresh Reminders Error : ' + err,
              buttons: ['OK']
            });
            errAlert.present();
          });
        },
      }]
    });
    confirmAlert.present();    
  }

  private deleteCalendar(calendarName: string) : Promise<any> {
    return this.calendar.listCalendars()
    .then((calendars) => {
      let result = Promise.resolve();
      for (let i = 0; i < calendars.length; i++) {
        if (calendars[i].name === calendarName) {
          result = this.calendar.deleteCalendar(calendarName);
          break;
        }
      }
      return result;
    });
  }

  private recreateCalendar(calendarName: string) : Promise<any> {
    return this.deleteCalendar(calendarName)
    .then(() => {
      return this.calendar.createCalendar(calendarName);
    });
  }

  private refreshCalendarEvents(calendarName: string) : Promise<any> {
    // Delete calendar
    return this.recreateCalendar(calendarName)
    .then((calendarId) => {
      let addExpireEvent4CouponItem = function(couponItem : CouponItem) : Promise<any> {
        let options = this.calendar.getCalendarOptions();
        options.calendarId = calendarId;
        options.calendarName = CALENDAR_NAME;

        let eventDateStart = new Date(couponItem.coupon.endDate);
        eventDateStart.setHours(10);
        let eventDateEnd = new Date(eventDateStart.getTime() + 1000);
        let eventTitle = couponItem.coupon.name + ' Expire !!!';
        let eventLocation = CALENDAR_EVENT_LOCATION;
// console.log('Adding Expiry Event [' + eventTitle + ']@[' + eventDateStart + ']...');
        return this.calendar.createEventWithOptions(
          eventTitle,
          eventLocation,
          null,
          eventDateStart,
          eventDateEnd,
          options)
          .then(value => {
// console.log('Adding Expiry Event [' + eventTitle + ']@[' + eventDateStart + ']... Done');
            return value;
          })
          .catch(err => {
// console.log('Adding Expiry Event [' + eventTitle + ']@[' + eventDateStart + ']... Failed: ' + err);
            throw err;
          });
      };

      let addStartEvent4CouponItem = function(couponItem : CouponItem) : Promise<any> {
        let options = this.calendar.getCalendarOptions();
        options.calendarId = calendarId;
        options.calendarName = CALENDAR_NAME;

        let eventDateStart = new Date(couponItem.coupon.startDate);
        eventDateStart.setHours(10);
        let eventDateEnd = new Date(eventDateStart.getTime() + 1000);
        let eventTitle = couponItem.coupon.name + ' Start !!!';
        let eventLocation = CALENDAR_EVENT_LOCATION;
// console.log('Adding Start Event [' + eventTitle + ']@[' + eventDateStart + ']...');
        return this.calendar.createEventWithOptions(
          eventTitle,
          eventLocation,
          null,
          eventDateStart,
          eventDateEnd,
          options)
          .then(value => {
// console.log('Adding Start Event [' + eventTitle + ']@[' + eventDateStart + ']... Done');
            return value;
          })
          .catch(err => {
// console.log('Adding Start Event [' + eventTitle + ']@[' + eventDateStart + ']... Failed: ' + err);
            throw err;
          });
      };
      
      // let promises = [];
      // promises = promises.concat(this.couponItems4Current.map(couponItem => {
      //   return addExpireEvent4CouponItem(couponItem);
      // }));
      // promises = promises.concat(this.couponItems4Future.map(couponItem => {
      //   return Promise.all([addStartEvent4CouponItem(couponItem), addExpireEvent4CouponItem(couponItem)]);
      // }));

      // return Promise.all(promises);

      return this.seqProcess(this.couponItems4Current, addExpireEvent4CouponItem)
      .then(results => {
        return this.seqProcess(this.couponItems4Future, addStartEvent4CouponItem);
      })
      .then(results => {
        return this.seqProcess(this.couponItems4Future, addExpireEvent4CouponItem);
      });
    });
  }

  private seqProcess(array, fn) : Promise<any> {
    var results = [];

    return array.reduce(function(p, item) {
      return p.then(function() {
        return fn(item).then(function(result) {
          results.push(result);
          return results;
        });
      });
    }, Promise.resolve());
  }
}
