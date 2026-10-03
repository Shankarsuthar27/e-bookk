#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX_NODES 100
#define MAX_EDGES 1000
#define INF 1000000000

typedef struct {
    int to;
    int cap;
    int cost;
    int rev;
} Edge;

Edge graph[MAX_NODES][MAX_EDGES];
int edge_count[MAX_NODES];

void add_edge(int u, int v, int cap, int cost) {
    // Forward edge
    graph[u][edge_count[u]].to = v;
    graph[u][edge_count[u]].cap = cap;
    graph[u][edge_count[u]].cost = cost;
    graph[u][edge_count[u]].rev = edge_count[v];
    
    // Residual backward edge
    graph[v][edge_count[v]].to = u;
    graph[v][edge_count[v]].cap = 0;
    graph[v][edge_count[v]].cost = -cost;
    graph[v][edge_count[v]].rev = edge_count[u];
    
    edge_count[u]++;
    edge_count[v]++;
}

int cmp(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

int main() {
    int N, M;
    if (scanf("%d %d", &N, &M) != 2) return 0;
    
    int edges_u[MAX_EDGES];
    int edges_v[MAX_EDGES];
    int unique_towns[MAX_EDGES * 2];
    int num_unique = 0;
    
    // Read edges
    for (int i = 0; i < M; i++) {
        scanf("%d %d", &edges_u[i], &edges_v[i]);
        unique_towns[num_unique++] = edges_u[i];
        unique_towns[num_unique++] = edges_v[i];
    }
    
    int s1, s2, outpost;
    scanf("%d %d", &s1, &s2);
    scanf("%d", &outpost);
    
    unique_towns[num_unique++] = s1;
    unique_towns[num_unique++] = s2;
    unique_towns[num_unique++] = outpost;
    
    // Coordinate compression to map towns to 1..actual_N
    qsort(unique_towns, num_unique, sizeof(int), cmp);
    int actual_N = 0;
    if (num_unique > 0) {
        int j = 0;
        for (int i = 1; i < num_unique; i++) {
            if (unique_towns[i] != unique_towns[j]) {
                j++;
                unique_towns[j] = unique_towns[i];
            }
        }
        actual_N = j + 1;
    }
    
    // Helper lambda-like to get the ID
    int get_id(int val) {
        for (int i = 0; i < actual_N; i++) {
            if (unique_towns[i] == val) return i + 1;
        }
        return -1;
    }
    
    int S = 0;
    int T = 2 * actual_N + 1;
    int O_id = get_id(outpost);
    
    // Vertex capacities
    for (int i = 0; i < actual_N; i++) {
        int u = i + 1;
        if (u == O_id) {
            add_edge(u, T, 2, 0); // Target accepts 2 paths
        } else {
            add_edge(u, u + actual_N, 1, 1); // 1 capacity, cost 1 to count towns
        }
    }
    
    // Connect Super-Source to the 2 start towns
    add_edge(S, get_id(s1), 1, 0);
    add_edge(S, get_id(s2), 1, 0);
    
    // Connect roads
    for (int i = 0; i < M; i++) {
        int u_id = get_id(edges_u[i]);
        int v_id = get_id(edges_v[i]);
        
        if (u_id != O_id) {
            add_edge(u_id + actual_N, v_id, 1, 0);
        }
        if (v_id != O_id) {
            add_edge(v_id + actual_N, u_id, 1, 0);
        }
    }
    
    // Successive Shortest Path (SPFA)
    int total_flow = 0;
    int total_cost = 0;
    
    for (int iter = 0; iter < 2; iter++) {
        int dist[MAX_NODES];
        int parent_node[MAX_NODES];
        int parent_edge[MAX_NODES];
        bool in_queue[MAX_NODES];
        
        for (int i = 0; i <= T; i++) {
            dist[i] = INF;
            parent_node[i] = -1;
            in_queue[i] = false;
        }
        
        // Circular Queue for SPFA
        int queue[MAX_NODES];
        int head = 0, tail = 0;
        
        queue[tail] = S;
        tail = (tail + 1) % MAX_NODES;
        dist[S] = 0;
        in_queue[S] = true;
        
        while (head != tail) {
            int u = queue[head];
            head = (head + 1) % MAX_NODES;
            in_queue[u] = false;
            
            for (int i = 0; i < edge_count[u]; i++) {
                Edge e = graph[u][i];
                if (e.cap > 0 && dist[e.to] > dist[u] + e.cost) {
                    dist[e.to] = dist[u] + e.cost;
                    parent_node[e.to] = u;
                    parent_edge[e.to] = i;
                    
                    if (!in_queue[e.to]) {
                        queue[tail] = e.to;
                        tail = (tail + 1) % MAX_NODES;
                        in_queue[e.to] = true;
                    }
                }
            }
        }
        
        if (dist[T] == INF) {
            break;
        }
        
        // Augment flow along the shortest path
        int curr = T;
        while (curr != S) {
            int p = parent_node[curr];
            int idx = parent_edge[curr];
            int rev_idx = graph[p][idx].rev;
            
            graph[p][idx].cap -= 1;
            graph[curr][rev_idx].cap += 1;
            
            curr = p;
        }
        
        total_flow += 1;
        total_cost += dist[T];
    }
    
    if (total_flow == 2) {
        printf("%d\n", total_cost);
    } else {
        printf("Impossible\n");
    }
    
    return 0;
}