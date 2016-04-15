import methodStubs from './configs/method_stubs';
import actions from './actions';
import './configs/types';

export default {
  actions,
  load(context) {
    methodStubs(context);
  }
};
