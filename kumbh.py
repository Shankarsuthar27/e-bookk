import sys
from collections import deque

def solve():
    # Read all lines from standard input and remove empty ones
    input_data = sys.stdin.read().splitlines()
    lines = [line.strip() for line in input_data if line.strip()]
    
    if not lines:
        return
        
    N = int(lines[0])
    
    adj = {}
    
    # Helper functions to dynamically manage graph edges
    def add_edge(u, v):
        if u not in adj:
            adj[u] = set()
        if v not in adj:
            adj[v] = set()
        adj[u].add(v)
        adj[v].add(u)
        
    def remove_edge(u, v):
        if u in adj and v in adj[u]:
            adj[u].remove(v)
        if v in adj and u in adj[v]:
            adj[v].remove(u)
            
    # 1. Parse initial connections
    for i in range(1, N + 1):
        parts = lines[i].split()
        if not parts:
            continue
        u = parts[0]
        for v in parts[1:]:
            add_edge(u, v)
            
    Q_idx = N + 1
    Q = int(lines[Q_idx])
    
    # Collect all queries
    queries = []
    for i in range(Q_idx + 1, Q_idx + 1 + Q):
        queries.append(lines[i].split())
        
    R_idx = Q_idx + 1 + Q
    
    # 2. Parse restrictions
    restrictions = {}
    if R_idx < len(lines):
        R = int(lines[R_idx])
        for i in range(R_idx + 1, R_idx + 1 + R):
            parts = lines[i].split()
            if parts:
                u = parts[0]
                restrictions[u] = set(parts[1:])
                
    # 3. Execute all queries sequentially
    for q in queries:
        if len(q) == 3:
            action = q[1]
            
            if action == "to":
                u = q[0]
                v = q[2]
                
                restricted = restrictions.get(u, set())
                
                # If source is same as destination, trip is instantly possible
                if u == v:
                    print("yes")
                    continue
                    
                visited = set([u])
                queue = deque([u])
                found = False
                
                # Breadth-First Search (BFS) to find if a valid route exists
                while queue:
                    curr = queue.popleft()
                    
                    if curr == v:
                        found = True
                        break
                        
                    for neighbor in adj.get(curr, []):
                        # Explore only if the station is unvisited and not strictly restricted
                        if neighbor not in visited and neighbor not in restricted:
                            visited.add(neighbor)
                            queue.append(neighbor)
                            
                            if neighbor == v:
                                found = True
                                break
                    if found:
                        break
                        
                if found:
                    print("yes")
                else:
                    print("no")
                    
            elif action == "connects":
                add_edge(q[0], q[2])
                
            elif action == "disconnects":
                remove_edge(q[0], q[2])

if __name__ == '__main__':
    solve()