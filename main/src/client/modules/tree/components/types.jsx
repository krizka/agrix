/**
 * Created by kriz on 13/04/16.
 */

import {MarkdownEditor} from 'react-markdown-editor';

export const NodeText = ({ node }) => {
  return (<MarkdownEditor initialContent={`Text: ${node.name}`} />)
};

export const NodeTextEdit = React.createClass({
  save() {
    const name = this.refs.name.value;
    this.props.set({ name });
  },

  render(){
    const { node } = this.props;

    return (<div>
      <input ref="name" type="text" defaultValue={`Text: ${node.name}`}/>
      <button onClick={this.save}>Save</button>
    </div>);
  }
});

export const NodeComment = ({ node }) => {
  return (<div>Comment: {node.name}</div>)
};

export const NodeCommentTest = ({ node }) => {
  return (<button>Comment: {node.name}</button>)
};
