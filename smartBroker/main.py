import logging
import asyncio
from smartBroker import Broker

logger = logging.getLogger(__name__)

config = {
    'listeners': {
        'default':{
            'type': 'tcp',
            'bind': '192.168.0.200:2222' 
        }
    },
    'sys_interval': 30,
    'topic-check':{
        'enabled': True,
        'acl':{
            'anonymous': ["public/#"],
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