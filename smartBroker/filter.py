from ast import literal_eval
import re


from filterClass.fc_index import index

ERR = '--> Filter : '

class Action:
    def __init__(self,type) -> None:
        self.full_type = type
        res = re.search('^([a-zA-Z0-9_]+)\(?([a-zA-Z0-9,;\"\'\[\]]*)\)?$',type)
        if res == None or len(res.groups()) != 2:
            print(f"{ERR}error during parsing action cannot find action of type => action_exemple(arg1,arg2...)")
            raise
        self.type = res.group(1)
        args = res.group(2).split(";") if res.group(2) != '' else []
        try:
            self.args = [literal_eval(arg) for arg in args]
        except:
            print("Filter : error during parsing args to appropriate type. Some args must be wrote wrong")
            raise
        
        if not self.type in index:
            print(f"{ERR}error, the action '{self.type}' doesn't exist")
            raise
        try:
            self.action = index[self.type](self.args)
        except:
            print(f"{ERR}error during instanciation of the action")
            raise

    


class Filter:
    def __init__(self) -> None:
        self.topics = {}
        

    def get(self,header,broadcast):
        topic = broadcast['topic']
        if header == 'delete':
            if self.topics.pop(topic,None) == None:
                print(f"{ERR}Topic {topic} cannot be delete because it doesn't exist")
            return None
        
        if (not topic in self.topics) or self.topics[topic].full_type != header: # not action or action change for this topic
            self.topics.pop(topic,None)
            try:
                self.topics[topic] = Action(header)
            except:
                print(f"{ERR}error during creation/change action for topic {topic}")
                return None
        return self.topics[topic].action.get(broadcast)

            

    
















