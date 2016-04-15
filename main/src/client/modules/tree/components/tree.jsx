import Tree from 'react-ui-tree';
import React from 'react';
import cx from 'classnames';

const RenderTree = React.createClass({
  getInitialState() {
    return {
      selected: undefined
    }
  },

  handleClick(node) {
    const _id = node.node._id;
    if (this.state.selected !== _id) {
      this.setState({ selected: _id });
      this.props.onSelect && this.props.onSelect(node);
    }
    console.dir(node);
  },

  renderNode(node) {
    const active = this.state.selected === node.node._id;
    const onClick = this.handleClick.curry(node);
    return (<div className={cx("some-node", { active })} onClick={onClick}>{node.module}</div>);
  },

  handleChange(tree) {
    console.log(tree);
    this.setState({ tree });
  },

  render() {
    return (
      <Tree
        paddingLeft={15}
        onChange={this.handleChange}
        tree={this.props.tree}
        renderNode={this.renderNode}
        draggable={false}
      />
    )
  },

  createPost() {
    const { create } = this.props;
    const { titleRef, contentRef } = this.refs;

    create(titleRef.value, contentRef.value);
  }
});

export default RenderTree;
