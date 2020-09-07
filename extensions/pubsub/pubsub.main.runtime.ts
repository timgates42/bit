import { MainRuntime } from '@teambit/cli';

import { PubsubAspect } from './pubsub.aspect';

export class PubsubMain {
  private topicMap = {};

  static runtime = MainRuntime;
  static _singletonPubsub: any = null;

  createOrGetTopic = (topicUUID) => {
    this.topicMap[topicUUID] = this.topicMap[topicUUID] || [];

    console.log('--createOrGetTopic--> ', topicUUID);
  };

  subscribeToTopic = (topicUUID, callback) => {
    this.topicMap[topicUUID].push(callback);

    console.log('--subscribeToTopic--> ', topicUUID);
  };

  publishToTopic = (topicUUID, event) => {
    this.topicMap[topicUUID].forEach((callback) => callback(event));

    console.log('--publishToTopic--> ', topicUUID);
  };

  static async provider() {
    console.log('hi pubsub');
    if (!this._singletonPubsub) {
      this._singletonPubsub = new PubsubMain();
    }
    return this._singletonPubsub;
  }
}

PubsubAspect.addRuntime(PubsubMain);
