/**
 * Created by kriz on 13/04/16.
 */

import {NodeText, NodeTextEdit, NodeComment, NodeCommentTest} from '../components/types.jsx';


const types = {
};

function getComponent(env) {
  return this.env[env] || this.component;
}

export function addTypes(newTypes) {
  _.each(newTypes, (type) => {
    type.getComponent = getComponent;
  });

  Object.assign(types, newTypes);
}

export default types;

addTypes({
  text: {
    component: NodeText,
    env: {
      'edit': NodeTextEdit,
      'test': NodeCommentTest,
    }
  },
  comment: {
    component: NodeComment,
    env: {
      'test': NodeCommentTest
    }
  }
});

