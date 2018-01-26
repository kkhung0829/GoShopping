import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoppingCurrItemListPage } from './shopping-curr-item-list';

@NgModule({
  declarations: [
    ShoppingCurrItemListPage,
  ],
  imports: [
    IonicPageModule.forChild(ShoppingCurrItemListPage),
  ],
})
export class ShoppingCurrItemListPageModule {}
