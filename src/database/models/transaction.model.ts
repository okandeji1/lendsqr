import { Model } from 'objection';

export class UserTransaction extends Model {
  static get tableName() {
    return 'transactions';
  }
}
