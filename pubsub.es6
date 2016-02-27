import * as PubSub from 'node-pubsub';
import config from 'config';

const debug = true;
const remote = config.get('IPC.allowRemote');
const id = config.get('Server.port');

export default new PubSub.Master(id, {debug, remote});
