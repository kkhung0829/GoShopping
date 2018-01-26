import { Injectable } from '@angular/core';
import { Item } from '../../models';
import { BroadcasterProvider } from '../broadcaster/broadcaster';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

@Injectable()
export class CurrItemStoreProvider {
  Event = {
    Update: 'CurrItemStore.Event.Update',
  };

  private _db;

  constructor(private broadcaster: BroadcasterProvider) {
  }

  initDB() {
    this._db = new PouchDB(
      'CurrItemStore',
      {
        auto_compaction: true,
        // adapter: 'websql',
      });
  }

  destroy() {
    this._db.destroy();
  }

  add(item : Item) : Promise<any> {
    item._id = (new Date()).getTime().toString();

    return this._db.put(item).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  update(item : Item) : Promise<any> {
    return this._db.put(item).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  delete(item : Item) : Promise<any> {
    return this._db.remove(item).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  deleteAll() : Promise<any> {
    return this._db.allDocs().then(docs => {
      return Promise.all(docs.rows.map(row => {
        return this._db.remove(row.id, row.value.rev);
      }));
    }).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  getAll() : Promise<Item[]> {
    return this._db.find({
      selector: {_id: {$exists: true}},
      sort: [{'_id': 'desc'}]
    }).then(result => {
        return result.docs;
    }).catch(err => {
        console.log('CurrentShopItemStore.getAll: PouchDB.find() error: ' + err);
        throw(err);
    });
  }
}
