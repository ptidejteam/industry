class Pattern:
    def __init__(self,args) -> None:
        self.patern = args[0]
        self.count = 0
    def get(self,broadcast):
        value = self.patern[self.count]
        self.count = (self.count + 1) % len(self.patern)
        return broadcast if value else None

