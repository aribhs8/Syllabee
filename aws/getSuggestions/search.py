
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.failure_link = None
        

class searchText:
    
    def __init__(self):
        self.trie_root = None
    
    def build_trie(self, keywords):
        root = TrieNode()
        for keyword in keywords:
            node = root
            for char in keyword.lower():
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.is_end_of_word = True
        self.trie_root = root
    
    def build_failure_links(self):
        queue = []
        for child in self.trie_root.children.values():
            queue.append(child)
            child.failure_link = self.trie_root
    
        while queue:
            current_node = queue.pop(0)
    
            for char, child in current_node.children.items():
                queue.append(child)
                failure_node = current_node.failure_link
    
                while failure_node and char not in failure_node.children:
                    failure_node = failure_node.failure_link
    
                child.failure_link = failure_node.children[char] if failure_node else self.trie_root
    
    def search_keywords(self,text):
        node = self.trie_root
        keyword_buffer = []
        matches = set()
    
        for char in text.lower():
            while node and char not in node.children:
                node = node.failure_link
    
            if not node:
                node = self.trie_root
                keyword_buffer = []
                continue
    
            node = node.children[char]
            keyword_buffer.append(char)
    
            if node.is_end_of_word:
                keyword = ''.join(keyword_buffer)
                matches.add(keyword)
    
                # Reset the Trie node and keyword buffer for the next search
                node = self.trie_root
                keyword_buffer = []
        
        return list(matches)