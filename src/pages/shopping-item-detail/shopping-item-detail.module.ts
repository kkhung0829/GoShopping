import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoppingItemDetailPage } from './shopping-item-detail';

@NgModule({
  declarations: [
    ShoppingItemDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ShoppingItemDetailPage),
  ],
})
export class ShoppingItemDetailPageModule {}
