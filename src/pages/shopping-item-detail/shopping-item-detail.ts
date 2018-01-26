import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { Camera } from '@ionic-native/camera';

import { Item } from '../../models';
import { CurrItemStoreProvider } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-shopping-item-detail',
  templateUrl: 'shopping-item-detail.html',
})
export class ShoppingItemDetailPage {
  item: Item = {
    name: '',
    unitPrice: 0,
    numUnit: 1,
    imgURI: ''
  };
  isNew: boolean = true;
  action: string = 'Add';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private camera: Camera,
              private itemStore: CurrItemStoreProvider) {}

  ionViewDidLoad() {
    let item = this.navParams.get('item');

    if (item) {
      this.item = item;
      this.isNew = false;
      this.action = 'Edit';
    } else {
      this.takePhoto(true);
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    this.item.unitPrice = Number(this.item.unitPrice);
    this.item.numUnit = Number(this.item.numUnit);
    
    if (this.isNew) {
      this.itemStore.add(this.item);
    } else {
      this.itemStore.update(this.item);
    }

    this.dismiss();
  }

  delete() {
    this.itemStore.delete(this.item);

    this.dismiss();
  }

  takePhoto(bFromCamera : boolean) {
    var options = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: bFromCamera ? this.camera.PictureSourceType.CAMERA : this.camera.PictureSourceType.PHOTOLIBRARY,
//      allowEdit: true,
      encodingType: this.camera.EncodingType.JPEG,
//      targetWidth: 500,
//      targetHeight: 500,
//      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.item.imgURI = "data:image/jpeg;base64," + imageData;
    }, (err) => {
    });
  }
}
