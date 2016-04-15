import TreePage from '../components/page.jsx';
import {Nodes} from 'lib/collections';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

function nodeToTreeRec(node, childHash) {
  const parent = childHash[node._id];
  const children = parent && parent.map(c => nodeToTreeRec(c, childHash));
  return {
    module: node.name,
    leaf: !(children && children.length),
    children: children,
    node
  }
}

function nodesToTree(nodes) {
  const children = {};
  let root = undefined;
  nodes.forEach(node => {
    if (node.parent) {
      const parent = children[node.parent] || (children[node.parent] = []);
      parent.push(node);
    } else if (node._id == 'root') {
      root = node;
    }
  });

  return nodeToTreeRec(root || { name: '<Empty tree>' }, children);
}

export const composer = ({ context, clearErrors }, onData) => {
  if (Meteor.subscribe('nodes.all').ready()) {
    const nodes = Nodes.find().fetch();
    const tree = nodesToTree(nodes);
    onData(null, { tree });
  }


//  const {LocalState} = context();
//  const error = LocalState.get('SAVING_ERROR');

  // clearErrors when unmounting the component
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  create: actions.posts.create,
  clearErrors: actions.posts.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(TreePage);
