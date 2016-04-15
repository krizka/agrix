/**
 * Created by kriz on 13/04/16.
 */

import {Nodes} from 'lib/collections';
import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

export default function () {
  Meteor.publish('nodes.all', function () {
    const selector = {};
    const options = {
//      fields: {_id: 1, title: 1},
//      sort: {createdAt: -1},
//      limit: 10
    };

    return Nodes.find(selector, options);
  });

}
