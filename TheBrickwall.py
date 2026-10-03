import sys
import heapq
import re

def solve():
    # Read all input from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    N = int(input_data[0])
    lines = input_data[1:N+1]
    
    grid = [[-1] * N for _ in range(N)]
    brick_type = {}
    
    brick_id = 0
    S_ids = []
    D_ids = []
    
    # 1. Parse the layout and build the ID grid
    for r in range(N):
        line = lines[r]
        # Match groups of digits followed by the brick type letter
        matches = re.findall(r'(\d+)([A-Z])', line)
        c = 0
        for length_str, b_type in matches:
            length = int(length_str)
            brick_type[brick_id] = b_type
            
            if b_type == 'S':
                S_ids.append(brick_id)
            elif b_type == 'D':
                D_ids.append(brick_id)
            
            for _ in range(length):
                if c < N:
                    grid[r][c] = brick_id
                c += 1
            brick_id += 1
            
    # 2. Build the Adjacency List for the graph
    adj = {i: set() for i in range(brick_id)}
    
    for r in range(N):
        for c in range(N):
            u = grid[r][c]
            if u == -1:
                continue
                
            # Check downward neighbor
            if r + 1 < N:
                v = grid[r+1][c]
                if v != -1 and u != v:
                    adj[u].add(v)
                    adj[v].add(u)
                    
            # Check rightward neighbor
            if c + 1 < N:
                v = grid[r][c+1]
                if v != -1 and u != v:
                    adj[u].add(v)
                    adj[v].add(u)
                    
    # 3. Dijkstra's Algorithm to find the path of minimum broken green bricks
    dist = {i: float('inf') for i in range(brick_id)}
    pq = []
    
    for s in S_ids:
        dist[s] = 0
        heapq.heappush(pq, (0, s))
        
    D_set = set(D_ids)
    
    while pq:
        d, u = heapq.heappop(pq)
        
        if d > dist[u]:
            continue
            
        # Reached a destination brick
        if u in D_set:
            print(d)
            return
            
        for v in adj[u]:
            b_type = brick_type[v]
            
            # Red bricks cannot be broken or bypassed
            if b_type == 'R':
                continue
            
            # Cost is 1 if breaking a Green Brick, otherwise 0 for Destination
            weight = 1 if b_type == 'G' else 0
            
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))

if __name__ == '__main__':
    solve()