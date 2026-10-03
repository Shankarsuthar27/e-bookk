#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_N 30
#define MAX_BRICKS 1000
#define INF 1000000000

unsigned char adj[MAX_BRICKS][MAX_BRICKS];
int grid[MAX_N][MAX_N];
char brick_type[MAX_BRICKS];
int dist[MAX_BRICKS];

int q[200000];
int q_head = 100000;
int q_tail = 100000;

int main() {
    int N;
    if (scanf("%d", &N) != 1) {
        return 0;
    }

    int brick_id = 0;
    char line[1024];
    
    // 1. Parse the input grid
    for (int r = 0; r < N; r++) {
        scanf("%s", line);
        char *p = line;
        int c = 0;
        
        while (*p != '\0') {
            if (isdigit(*p)) {
                int len = 0;
                // Read the block length
                while (isdigit(*p)) {
                    len = len * 10 + (*p - '0');
                    p++;
                }
                // Read the block type (R, G, S, D)
                char type = *p;
                if (type != '\0') p++;
                
                // Assign identical IDs to cells belonging to the same brick
                for (int i = 0; i < len; i++) {
                    if (c < N) {
                        grid[r][c] = brick_id;
                    }
                    c++;
                }
                brick_type[brick_id] = type;
                brick_id++;
            } else {
                p++;
            }
        }
    }
    
    // 2. Build the adjacency matrix (Graph)
    memset(adj, 0, sizeof(adj));
    for (int r = 0; r < N; r++) {
        for (int c = 0; c < N; c++) {
            int curr = grid[r][c];
            
            // Check right neighbor
            if (c + 1 < N) {
                int nxt = grid[r][c + 1];
                if (curr != nxt) {
                    adj[curr][nxt] = 1;
                    adj[nxt][curr] = 1;
                }
            }
            
            // Check bottom neighbor
            if (r + 1 < N) {
                int nxt = grid[r + 1][c];
                if (curr != nxt) {
                    adj[curr][nxt] = 1;
                    adj[nxt][curr] = 1;
                }
            }
        }
    }
    
    // 3. Identify Source and Destination nodes
    int start_node = -1;
    int dest_node = -1;
    for (int i = 0; i < brick_id; i++) {
        if (brick_type[i] == 'S') start_node = i;
        if (brick_type[i] == 'D') dest_node = i;
        dist[i] = INF;
    }
    
    if (start_node == -1 || dest_node == -1) {
        printf("-1\n");
        return 0;
    }
    
    // 4. 0-1 BFS to find the shortest path 
    dist[start_node] = 0;
    q[q_tail++] = start_node;
    
    while (q_head < q_tail) {
        int u = q[q_head++];
        
        // If we reached the destination, print the result and terminate
        if (u == dest_node) {
            printf("%d\n", dist[u]);
            return 0;
        }
        
        for (int v = 0; v < brick_id; v++) {
            if (adj[u][v]) {
                // Red Bricks are impassable
                if (brick_type[v] == 'R') continue;
                
                // Cost is 1 for Green Bricks, 0 to enter the Destination itself
                int weight = (brick_type[v] == 'G') ? 1 : 0;
                
                // Edge relaxation
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    
                    // 0-weight edges go to the front of the queue, 1-weight edges to the back
                    if (weight == 0) {
                        q[--q_head] = v;
                    } else {
                        q[q_tail++] = v;
                    }
                }
            }
        }
    }
    
    // Fallback if no valid path exists
    printf("-1\n");
    return 0;
}