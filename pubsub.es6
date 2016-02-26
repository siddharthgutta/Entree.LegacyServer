import * as PubSub from 'node-pubsub';
import config from 'config';

const debug = true;
const remote = true;
const appspace = config.get('Server.port');

export default new PubSub.Master({appspace, debug, remote});
