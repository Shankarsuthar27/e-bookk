import sys
from collections import deque
import operator

# Base 90-degree clockwise permutations for the 6 faces
def move_U(p):
    p = list(p)
    p[0], p[1], p[3], p[2] = p[2], p[0], p[1], p[3]
    p[4], p[16], p[15], p[20] = p[20], p[4], p[16], p[15]
    p[5], p[17], p[14], p[21] = p[21], p[5], p[17], p[14]
    return tuple(p)

def move_D(p):
    p = list(p)
    p[8], p[9], p[11], p[10] = p[10], p[8], p[9], p[11]
    p[6], p[18], p[13], p[22] = p[22], p[6], p[18], p[13]
    p[7], p[19], p[12], p[23] = p[23], p[7], p[19], p[12]
    return tuple(p)

def move_F(p):
    p = list(p)
    p[4], p[5], p[7], p[6] = p[6], p[4], p[5], p[7]
    p[2], p[20], p[9], p[19] = p[19], p[2], p[20], p[9]
    p[3], p[22], p[8], p[17] = p[17], p[3], p[22], p[8]
    return tuple(p)

def move_B(p):
    p = list(p)
    p[12], p[13], p[15], p[14] = p[14], p[12], p[13], p[15]
    p[1], p[16], p[10], p[23] = p[23], p[1], p[16], p[10]
    p[0], p[18], p[11], p[21] = p[21], p[0], p[18], p[11]
    return tuple(p)

def move_L(p):
    p = list(p)
    p[16], p[17], p[19], p[18] = p[18], p[16], p[17], p[19]
    p[0], p[4], p[8], p[12] = p[12], p[0], p[4], p[8]
    p[2], p[6], p[10], p[14] = p[14], p[2], p[6], p[10]
    return tuple(p)

def move_R(p):
    p = list(p)
    p[20], p[21], p[23], p[22] = p[22], p[20], p[21], p[23]
    p[3], p[15], p[11], p[7] = p[7], p[3], p[15], p[11]
    p[1], p[13], p[9], p[5] = p[5], p[1], p[13], p[9]
    return tuple(p)

def main():
    input_str = sys.stdin.read().split()
    if not input_str:
        return
    start_p = tuple(input_str)
    
    # Precompute all 18 moves (90, 180, 270 degrees for 6 faces) to ensure lightning-fast BFS
    base_state = tuple(range(24))
    base_moves = [move_U, move_D, move_F, move_B, move_L, move_R]
    perms = []
    for m in base_moves:
        p1 = m(base_state)
        p2 = m(p1)
        p3 = m(p2)
        perms.extend([p1, p2, p3])
        
    getters = [operator.itemgetter(*p) for p in perms]
    
    # Map of 3 intersecting face indices (U:0, F:1, D:2, B:3, L:4, R:5) -> exact 0-based sticker indices on the corner
    corners_map = {
        frozenset({0, 1, 4}): (2, 4, 17),   # Up-Front-Left
        frozenset({0, 1, 5}): (3, 5, 20),   # Up-Front-Right
        frozenset({2, 1, 4}): (8, 6, 19),   # Down-Front-Left
        frozenset({2, 1, 5}): (9, 7, 22),   # Down-Front-Right
        frozenset({0, 3, 4}): (0, 14, 16),  # Up-Back-Left
        frozenset({0, 3, 5}): (1, 15, 21),  # Up-Back-Right
        frozenset({2, 3, 4}): (10, 12, 18), # Down-Back-Left
        frozenset({2, 3, 5}): (11, 13, 23)  # Down-Back-Right
    }
    
    q = deque([(start_p, 0)])
    visited = set([start_p])
    
    while q:
        curr, depth = q.popleft()
        
        # Check faces for solidity 
        solid_faces = []
        for i in range(6):
            if curr[i*4] == curr[i*4+1] == curr[i*4+2] == curr[i*4+3]:
                solid_faces.append(i)
                
        # If exactly 3 faces are solid, we found the un-shuffled state (only the twisted corner remains)
        if len(solid_faces) == 3:
            broken_faces = frozenset([i for i in range(6) if i not in solid_faces])
            if broken_faces in corners_map:
                indices = corners_map[broken_faces]
                colors = [curr[idx] for idx in indices]
                colors.sort()
                print("".join(colors))
                return
                
        # Traverse depth up to max 4 moves as defined by the problem constraint
        if depth < 4:
            for getter in getters:
                nxt = getter(curr)
                if nxt not in visited:
                    visited.add(nxt)
                    q.append((nxt, depth + 1))

if __name__ == '__main__':
    main()