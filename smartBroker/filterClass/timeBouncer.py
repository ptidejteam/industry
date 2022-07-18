
import time

class TimeBouncer:
    def __init__(self,args) -> None:

        if type(args[0]) != type(1):
            print(f"Filter : error, Dropper action need type int get type {type(args[0])}")
            raise
        self.interval = args[0] #in seconds
        self.last_time = 0

    
    def get(self,broadcast):
        now = int(time.time())
        if int(time.time()) - self.last_time >= self.interval:
            self.last_time = now
            return broadcast
        return None
    


