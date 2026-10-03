import sys

def solve():
    # Read all input from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Parse grid dimensions
    N = int(input_data[0])
    M = int(input_data[1])
    
    idx = 2
    grid = []
    for _ in range(N):
        row = []
        for _ in range(M):
            row.append(input_data[idx])
            idx += 1
        grid.append(row)
        
    T = int(input_data[idx])
    idx += 1
    
    I = int(input_data[idx])
    idx += 1
    
    # Initialize all cells as valid for all time steps
    valid = [[[True for _ in range(M)] for _ in range(N)] for _ in range(T + 1)]
    
    # Apply exclusion clues
    for _ in range(I):
        t = int(input_data[idx])
        x1 = int(input_data[idx+1])
        y1 = int(input_data[idx+2])
        x2 = int(input_data[idx+3])
        y2 = int(input_data[idx+4])
        idx += 5
        
        # Grid bounds in clue are 1-based indexing, convert them to 0-based
        for r in range(x1 - 1, x2):
            for c in range(y1 - 1, y2):
                if 0 <= r < N and 0 <= c < M:
                    valid[t][r][c] = False

    # --- Forward Reachability Pass ---
    fwd = [[[False for _ in range(M)] for _ in range(N)] for _ in range(T + 1)]
    any_valid_start = False
    
    for r in range(N):
        for c in range(M):
            if valid[1][r][c]:
                fwd[1][r][c] = True
                any_valid_start = True
                
    if not any_valid_start:
        print("Not enough clues")
        return
        
    for t in range(2, T + 1):
        any_valid = False
        for r in range(N):
            for c in range(M):
                if valid[t][r][c]:
                    ok = False
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        pr, pc = r + dr, c + dc
                        if 0 <= pr < N and 0 <= pc < M and fwd[t-1][pr][pc]:
                            ok = True
                            break
                    if ok:
                        fwd[t][r][c] = True
                        any_valid = True
                        
        if not any_valid:
            print("Not enough clues")
            return
            
    # --- Backward Reachability Pass ---
    bwd = [[[False for _ in range(M)] for _ in range(N)] for _ in range(T + 1)]
    
    for r in range(N):
        for c in range(M):
            if fwd[T][r][c]:
                bwd[T][r][c] = True
                
    for t in range(T - 1, 0, -1):
        any_valid = False
        for r in range(N):
            for c in range(M):
                if fwd[t][r][c]:
                    ok = False
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < N and 0 <= nc < M and bwd[t+1][nr][nc]:
                            ok = True
                            break
                    if ok:
                        bwd[t][r][c] = True
                        any_valid = True
                        
        if not any_valid:
            print("Not enough clues")
            return
            
    # Refine the valid array based on cells that survived both pruning passes
    for t in range(1, T + 1):
        for r in range(N):
            for c in range(M):
                valid[t][r][c] = bwd[t][r][c]
                
    # --- Depth First Search (DFS) on Filtered Graph ---
    found_keys = set()
    visited = [[False] * M for _ in range(N)]
    
    def dfs(t, r, c, current_string):
        if t == T:
            found_keys.add(current_string)
            # Short-circuit logic: we only care if the clues narrow it down to EXACTLY one word
            if len(found_keys) > 1:
                return True 
            return False
            
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < N and 0 <= nc < M:
                if valid[t+1][nr][nc] and not visited[nr][nc]:
                    visited[nr][nc] = True
                    if dfs(t+1, nr, nc, current_string + grid[nr][nc]):
                        return True
                    visited[nr][nc] = False
        return False
        
    for r in range(N):
        for c in range(M):
            if valid[1][r][c]:
                visited[r][c] = True
                if dfs(1, r, c, grid[r][c]):
                    break
                visited[r][c] = False
                
        if len(found_keys) > 1:
            break
            
    # Output Resolution based on uniqueness
    if len(found_keys) == 1:
        print(found_keys.pop())
    else:
        print("Not enough clues")

if __name__ == '__main__':
    solve()