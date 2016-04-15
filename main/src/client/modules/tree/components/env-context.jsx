/**
 * Created by kriz on 14/04/16.
 */

export const EnvType = React.PropTypes.string;

const EnvContext = React.createClass({
  contextTypes: {
    env: EnvType
  },

  childContextTypes: {
    env: EnvType
  },

  getChildContext: function() {
    const { env } = this.props;

    return { env };
  },

  render() {
    return <div>{this.props.children}</div>;
  }
});

export default EnvContext;
