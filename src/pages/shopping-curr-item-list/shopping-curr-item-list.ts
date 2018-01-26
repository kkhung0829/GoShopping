import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, AlertController } from 'ionic-angular';

import { Item } from '../../models';
import { CurrItemStoreProvider, BroadcasterProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-shopping-curr-item-list',
  templateUrl: 'shopping-curr-item-list.html',
})
export class ShoppingCurrItemListPage {
  items: Item[] = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private zone: NgZone,
              private platform: Platform,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private itemStore: CurrItemStoreProvider,
              private broadcaster: BroadcasterProvider) {}

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.reloadData();

      this.broadcaster.on<string>(this.itemStore.Event.Update)
        .subscribe(value => {
          console.log('ShoppingCurrItemListPage: event CurrItemStore.Event.Update received => reloadData()');
          this.reloadData();
        });
    });
  }

  reloadData() {
    this.itemStore.getAll()
    .then(items => {
      this.zone.run(() => {
        this.items = items;
      });
    })
    .catch(err => {
      console.log('Fail to load items [' + err + ']');
    });
  }

  calcTotalPrice() : number {
    let totalPrice : number = 0;
    let item : Item;
    let index : number;

    for (index = 0; index < this.items.length; index++) {
      item = this.items[index];
      totalPrice += item.unitPrice * item.numUnit;
    }
    return totalPrice;
  }

  addUnit(item: Item) {
    item.numUnit++;

    this.itemStore.update(item)
    .then(result => {
      console.log('Item Unit Added');
    })
    .catch(err => {
      console.log('Fail to update item unit [' + err + ']');
    });
  }

  decUnit(item: Item) {
    if (item.numUnit > 0) {
      item.numUnit--;

      this.itemStore.update(item)
      .then(result => {
        console.log('Item Unit Decreased');
      })
      .catch(err => {
        console.log('Fail to update item unit [' + err + ']');
      });
    }
  }

  remove(item: Item) {
    this.itemStore.delete(item)
    .then(result => {
      console.log('Item Unit Decreased');
    })
    .catch(err => {
      console.log('Fail to update item unit [' + err + ']');
    });
  }

  removeAll() {
    let confirmAlert = this.alertCtrl.create({
      title: 'Remove All',
      message: 'Confirm to remove all ?',
      buttons: [{
        text: 'Cancel',
        handler: data => {},
      }, {
        text: 'OK',
        handler: data => {
          this.itemStore.deleteAll()
          .then(() => {
            console.log('All items removed');
          })
          .catch(err => {
            console.log('Fail to remove all items [' + err + ']');
          });
        }
      }]      
    });
    confirmAlert.present();
  }

  showItemDetail(item: Item) {
    let modal = this.modalCtrl.create('ShoppingItemDetailPage', {item: item});
    modal.onDidDismiss(() => {});

    modal.present();
  }

  showImage(item: Item) {
    if (item.imgURI) {
      let modal = this.modalCtrl.create('ImageViewPage', {title: item.name, imgURI: item.imgURI});
      modal.onDidDismiss(() => {});

      modal.present();
    }
  }
}
