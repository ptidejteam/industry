import logging
import asyncio
from smartBroker import Broker

logger = logging.getLogger(__name__)

config = {
    'listeners': {
        'default':{
            'type': 'tcp',
            'bind': 'localhost:1883' 
        }
    },
    'sys_interval': 10,
    'topic-check':{
        'enabled': False,
        'acl':{
            'anonymous': ["ER/#"],
            }
    }
}

broker = Broker(config)

@asyncio.coroutine
def startBroker():
    yield from broker.start()

if __name__ == '__main__':
    formatter = "[%(asctime)s] :: %(levelname)s :: %(name)s :: %(message)s"
    logging.basicConfig(level=logging.INFO, format=formatter)
    asyncio.get_event_loop().run_until_complete(startBroker())
    asyncio.get_event_loop().run_forever()