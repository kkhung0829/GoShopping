import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

import { Coupon } from '../../models';
import { CouponStoreProvider } from '../../providers';

import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-coupon-detail',
  templateUrl: 'coupon-detail.html',
})
export class CouponDetailPage {
  coupon: Coupon = {
    name: '',
    startDate: moment().startOf('day').valueOf(),
    endDate: moment().startOf('day').valueOf(),
    numUnit: 1,
    usages: [],
  };
  isNew: boolean = true;
  action: string = 'Add';
  startDateStr: string;
  endDateStr: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private alertCtrl: AlertController,
              private couponStore: CouponStoreProvider) {}

  ionViewDidLoad() {
    let coupon = this.navParams.get('coupon');

    if (coupon) {
      this.coupon = coupon;
      this.isNew = false;
      this.action = 'Edit';      
    }
    this.startDateStr = moment(this.coupon.startDate).local().format();
    this.endDateStr = moment(this.coupon.endDate).local().format();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  genMinDate() {
    return (new Date()).getFullYear() - 100;
  }

  genMaxDate() {
    return (new Date()).getFullYear() + 100;
  }

  save() {
    this.coupon.numUnit = Number(this.coupon.numUnit);
    this.coupon.startDate = (new Date(this.startDateStr)).getTime();
    this.coupon.endDate = (new Date(this.endDateStr)).getTime();

    if (this.isNew) {
      this.couponStore.add(this.coupon);
    } else {
      this.couponStore.update(this.coupon);
    }

    this.dismiss();
  }

  delete() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Remove ' + this.coupon.name,
      message: 'Confirm to remove ' + this.coupon.name + ' ?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {},
        },
        {
          text: 'OK',
          handler: () => {
            this.couponStore.delete(this.coupon);
            this.dismiss();
          }
        }
      ],
    });
    confirmAlert.present();
  }
}
