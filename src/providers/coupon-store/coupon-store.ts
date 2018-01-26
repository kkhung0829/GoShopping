import { Injectable } from '@angular/core';
import { Coupon } from '../../models';
import { BroadcasterProvider } from '../broadcaster/broadcaster';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

@Injectable()
export class CouponStoreProvider {
  Event = {
    Update: 'CouponStore.Event.Update',
  };

  private _db;

  private _earlyMorning4Today: Date;
  private _earlyMorning4Tomorrow: Date;

  private _dbIndexParameter4Expired;
  private _dbFindParameter4Expired;
  private _dbIndexParameter4Today;
  private _dbFindParameter4Today;
  private _dbIndexParameter4Current;
  private _dbFindParameter4Current;
  private _dbIndexParameter4Future;
  private _dbFindParameter4Future;
  private _dbIndexParameter4All;
  private _dbFindParameter4All;

  constructor(private broadcaster: BroadcasterProvider) {
    this._earlyMorning4Today = new Date();
    this._earlyMorning4Today.setHours(0, 0, 0, 0);
    this._earlyMorning4Tomorrow = new Date(this._earlyMorning4Today.getTime() + 24*60*60*1000);

    // Search Parameters 4 Expired Coupon
    // end date < Today early morning
    // end date asc
    this._dbIndexParameter4Expired = {
      index: {
        fields: ['endDate'],
      }
    };
    this._dbFindParameter4Expired = {
      selector: {
        endDate: {$lt: this._earlyMorning4Today.getTime()}
      },
      sort: [{'endDate': 'asc'}],
    };

    // Search Parameters 4 Today Coupon
    // today early morning <= end date < tomorrow early morning
    // end date asc
    this._dbIndexParameter4Today = {
      index: {
        fields: ['endDate'],
      }
    };
    this._dbFindParameter4Today = {
      selector: {
        $and: [{
          endDate: {$gte: this._earlyMorning4Today.getTime()}
        }, {
          endDate: {$lt: this._earlyMorning4Tomorrow.getTime()}
        }],
      },
      sort: [{'endDate': 'asc'}],
    };

    // Search Parameters 4 Current Coupon
    // start date < tomorrow early morning
    // end date >= today early morning
    // end date asc
    this._dbIndexParameter4Current = {
      index: {
        fields: ['startDate', 'endDate'],
      }
    };
    this._dbFindParameter4Current = {
      selector: {
        startDate: {$lt: this._earlyMorning4Tomorrow.getTime()},
        endDate: {$gte: this._earlyMorning4Tomorrow.getTime()},
      },
      sort: [{'endDate': 'asc'}],
    };

    // Search Parameters 4 Future Coupon
    // start date >= tomorrow early morning
    // start date asc
    this._dbIndexParameter4Future = {
      index: {
        fields: ['startDate'],
      }
    };
    this._dbFindParameter4Future = {
      selector: {
        startDate: {$gte: this._earlyMorning4Tomorrow.getTime()}
      },
      sort: [{'startDate': 'asc'}],
    };

    // Search Parameters 4 All Coupon
    // _id exists
    // end date asc
    this._dbIndexParameter4All = {
      index: {
        fields: ['endDate'],
      }
    };
    this._dbFindParameter4All = {
      selector: {
        endDate: {'$gt': null},
      },
      sort: [{'endDate': 'asc'}],
    };
  }

  initDB() {
    this._db = new PouchDB(
      'CouponStore',
      {
        auto_compaction: true,
        // adapter: 'websql',
      });
  }

  destroy() {
    this._db.destroy();
  }

  add(coupon: Coupon) : Promise<any> {
    if (!coupon._id) {
      coupon._id = (new Date()).getTime().toString();
    }

    return this._db.put(coupon).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  update(coupon: Coupon) : Promise<any> {
    return this._db.put(coupon).then(response => {
      this.broadcaster.broadcast(this.Event.Update);
      return response;
    });
  }

  delete(coupon: Coupon) : Promise<any> {
    return this._db.remove(coupon).then(response => {
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

  getAllExpired() : Promise<Coupon[]> {
console.log('CouponStore.getAllExpired()...');
    return this._db.find(
      this._dbFindParameter4Expired
    ).then(result => {
console.log('CouponStore.getAllExpired()... return ' + result.docs.length + ' records');
      return result.docs;
    }).catch(err => {
      // No index => create index
console.log('CouponStore.getAllExpired() createIndex()...');
      return this._db.createIndex(
        this._dbIndexParameter4Expired
      ).then(result => {
console.log('CouponStore.getAllExpired() createIndex()... Done');
        return this._db.find(
          this._dbFindParameter4Expired
        ).then(result => {
console.log('CouponStore.getAllExpired()... return ' + result.docs.length + ' records');
          return result.docs;
        }).catch(err => {
          console.log('CouponStore.getAllExpired: PouchDB.find() error: ' + err);
          throw err;
        });
      });
    });
  }

  getAllToday() : Promise<Coupon[]> {
console.log('CouponStore.getAllToday()...');
    return this._db.find(
      this._dbFindParameter4Today
    ).then(result => {
console.log('CouponStore.getAllToday()... return ' + result.docs.length + ' records');
      return result.docs;
    }).catch(err => {
      // No index => create index
console.log('CouponStore.getAllToday() createIndex()...');
      return this._db.createIndex(
        this._dbIndexParameter4Today
      ).then(result => {
console.log('CouponStore.getAllToday() createIndex()... Done');
        return this._db.find(
          this._dbFindParameter4Today
        ).then(result => {
console.log('CouponStore.getAllToday()... return ' + result.docs.length + ' records');
          return result.docs;
        }).catch(err => {
          console.log('CouponStore.getAllToday: PouchDB.find() error: ' + err);
          throw err;
        });
      });
    });
  }


  getAllCurrent() : Promise<Coupon[]> {
console.log('CouponStore.getAllCurrent()...');
    return this._db.find(
      this._dbFindParameter4Current
    ).then(result => {
console.log('CouponStore.getAllCurrent()... return ' + result.docs.length + ' records');
      return result.docs;
    }).catch(err => {
      // No index => create index
console.log('CouponStore.getAllCurrent() createIndex()...');
      return this._db.createIndex(
        this._dbIndexParameter4Current
      ).then(result => {
console.log('CouponStore.getAllCurrent() createIndex()... Done');
        return this._db.find(
          this._dbFindParameter4Current
        ).then(result => {
console.log('CouponStore.getAllCurrent()... return ' + result.docs.length + ' records');
          return result.docs;
        }).catch(err => {
          console.log('CouponStore.getAllCurrent: PouchDB.find() error: ' + err);
          throw err;
        });
      });
    });
  }
  
  getAllFuture() : Promise<Coupon[]> {
console.log('CouponStore.getAllFuture()...');
    return this._db.find(
      this._dbFindParameter4Future
    ).then(result => {
console.log('CouponStore.getAllFuture()... return ' + result.docs.length + ' records');
      return result.docs;
    }).catch(err => {
      // No index => create index
console.log('CouponStore.getAllFuture() createIndex()...');
      return this._db.createIndex(
        this._dbIndexParameter4Future
      ).then(result => {
console.log('CouponStore.getAllFuture() createIndex()... Done');
        return this._db.find(
          this._dbFindParameter4Future
        ).then(result => {
console.log('CouponStore.getAllFuture()... return ' + result.docs.length + ' records');
          return result.docs;
        }).catch(err => {
          console.log('CouponStore.getAllFuture: PouchDB.find() error: ' + err);
          throw err;
        });
      });
    });
  }

  getAll() : Promise<Coupon[]> {
console.log('CouponStore.getAll()...');
    return this._db.find(
      this._dbFindParameter4All
    ).then(result => {
console.log('CouponStore.getAll()... return ' + result.docs.length + ' records');
      return result.docs;
    }).catch(err => {
      // No index => create index
console.log('CouponStore.getAll() createIndex()...');
      return this._db.createIndex(
        this._dbIndexParameter4All
      ).then(result => {
console.log('CouponStore.getAll() createIndex()... Done');
        return this._db.find(
          this._dbFindParameter4All
        ).then(result => {
console.log('CouponStore.getAll()... return ' + result.docs.length + ' records');
          return result.docs;
        }).catch(err => {
          console.log('CouponStore.getAll: PouchDB.find() error: ' + err);
          throw err;
        });
      });
    });
  }

  import(coupons : Coupon[]) : Promise<any> {
    return this.deleteAll()
    .then(() => {
      return Promise.all(coupons.map(coupon => {
        delete coupon._rev;
        return this.add(coupon);
      }));
    });
  }
}
