import Tree from './tree.jsx';
import React from 'react';
import cx from 'classnames';
import types from '../configs/types';
import {Nodes} from 'lib/collections';
import EnvContext, {EnvType} from './env-context.jsx';


const RenderNode = React.createClass({
  contextTypes: {
    env: EnvType
  },

  render() {
    const { type } = this.props.node;
    const Component = types[type].getComponent(this.context.env);

    return <Component {...this.props} />
  }
});

const NodeMenu = React.createClass({
  addMeta(type, name) {
    const { node } = this.props;
    const meta = {
      type: name,
      name: 'meta ' + name
    };

    Nodes.update(node._id, { $push: { meta } });
  },

  render() {

    return (<div className="btn-group" role="group" aria-label="...">
      {_.map(types, (t, name) =>
        <button key={name} onClick={this.addMeta.curry(t, name)} type="button" className="btn btn-default">{name}</button>
      )}
    </div>);
  }
});

const NodeAsList = React.createClass({
  render() {
    const { node, set } = this.props;
    const { meta = [] } = node;

    return ( <ul className="list-group">
      {meta.map((m, i) => <li key={i} className="list-group-item"><RenderNode node={m} set={set.curry(m)}/></li>)}
    </ul>);
  }
});

const TreePage = React.createClass({
  getInitialState() {
    return {
      selected: undefined,
      env: 'default'
    }
  },

  componentWillReceiveProps(newProps) {
    if (this.state.selected) {
      const _id = this.state.selected.node._id;
//      newProps.tree.
    }
  },

  handleSelect(node) {
    this.setState({ selected: node });
  },

  changeEnv(evt) {
    this.setState({ env: evt.target.value });
  },

  handleSetMeta(meta, fields) {
    const { _id } = this.state.selected.node;
    Nodes.update({ _id, 'meta.name': meta.name }, { $set: { 'meta.$': fields } });
  },

  render() {
    const { tree } = this.props;
    const { selected } = this.state;
//    < NodeList
//    nodes = {}
//      / >
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <Tree tree={tree} selected={selected} onSelect={this.handleSelect}/>
          </div>
          <div className="col-md-6">
            {selected ?
              <EnvContext env={this.state.env}>
                <input value={this.state.env} onChange={this.changeEnv}/>
                <NodeMenu node={selected.node}/>
                <NodeAsList node={selected.node} set={this.handleSetMeta}/>
              </EnvContext>
              : "Null"}
          </div>
        </div>
      </div>
    )
  },
});

export default TreePage;
