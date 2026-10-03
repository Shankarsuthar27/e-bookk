#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_NODES 20000
#define HASH_SIZE 20011

// Hash Map structures to map String station names to Integer IDs
typedef struct HashEntry {
    char name[105];
    int id;
    struct HashEntry *next;
} HashEntry;

HashEntry *hash_table[HASH_SIZE];
int num_nodes = 0;

// Simple string hashing function
unsigned int hash(char *str) {
    unsigned int h = 5381;
    int c;
    while ((c = *str++)) {
        h = ((h << 5) + h) + c;
    }
    return h % HASH_SIZE;
}

// Function to retrieve (or create) an integer ID for a station string
int get_node_id(char *name) {
    unsigned int h = hash(name);
    for (HashEntry *e = hash_table[h]; e != NULL; e = e->next) {
        if (strcmp(e->name, name) == 0) return e->id;
    }
    HashEntry *new_entry = (HashEntry *)malloc(sizeof(HashEntry));
    strcpy(new_entry->name, name);
    new_entry->id = num_nodes;
    new_entry->next = hash_table[h];
    hash_table[h] = new_entry;
    return num_nodes++;
}

// Graph Representation structures
typedef struct Edge {
    int to;
    int closed;
    struct Edge *next;
} Edge;

Edge *adj[MAX_NODES];
int closed_nodes[MAX_NODES];

// Function to add an undirected track (edge) between two stations
void add_edge(int u, int v) {
    Edge *e1 = (Edge *)malloc(sizeof(Edge));
    e1->to = v; e1->closed = 0; e1->next = adj[u]; adj[u] = e1;

    Edge *e2 = (Edge *)malloc(sizeof(Edge));
    e2->to = u; e2->closed = 0; e2->next = adj[v]; adj[v] = e2;
}

// Function to mark a specific track (edge) as closed
void close_edge(int u, int v) {
    for (Edge *e = adj[u]; e != NULL; e = e->next) {
        if (e->to == v) e->closed = 1;
    }
    for (Edge *e = adj[v]; e != NULL; e = e->next) {
        if (e->to == u) e->closed = 1;
    }
}

// BFS traversal queue and visited array
int queue[MAX_NODES];
int visited[MAX_NODES];

// Function to check if a valid path exists
int is_reachable(int src, int dest) {
    // If either the source or destination is a closed station, no path is possible
    if (closed_nodes[src] || closed_nodes[dest]) return 0;
    if (src == dest) return 1;

    // Reset visited array
    for (int i = 0; i < num_nodes; i++) visited[i] = 0;

    int head = 0, tail = 0;
    queue[tail++] = src;
    visited[src] = 1;

    while (head < tail) {
        int curr = queue[head++];
        
        for (Edge *e = adj[curr]; e != NULL; e = e->next) {
            // Traverse only if the track is open and the station is open and unvisited
            if (!e->closed && !closed_nodes[e->to] && !visited[e->to]) {
                visited[e->to] = 1;
                if (e->to == dest) return 1;
                queue[tail++] = e->to;
            }
        }
    }
    return 0; // Destination could not be reached
}

int main() {
    int N;
    if (scanf("%d", &N) != 1) return 0;

    char buffer[256];
    
    // Parse Initial Track Connections
    for (int i = 0; i < N; i++) {
        scanf("%s", buffer);
        char *dash = strchr(buffer, '-');
        if (dash != NULL) {
            *dash = '\0'; // Split into two strings
            int u = get_node_id(buffer);
            int v = get_node_id(dash + 1);
            add_edge(u, v);
        }
    }

    int M;
    // Parse Closed Tracks / Stations
    if (scanf("%d", &M) == 1) {
        for (int i = 0; i < M; i++) {
            scanf("%s", buffer);
            char *dash = strchr(buffer, '-');
            if (dash != NULL) {
                *dash = '\0'; // It's an edge
                int u = get_node_id(buffer);
                int v = get_node_id(dash + 1);
                close_edge(u, v);
            } else {
                // It's a single station node
                int u = get_node_id(buffer);
                closed_nodes[u] = 1;
            }
        }
    }

    int Q;
    // Evaluate Queries
    if (scanf("%d", &Q) == 1) {
        for (int i = 0; i < Q; i++) {
            char src_str[105], dest_str[105];
            scanf("%s %s", src_str, dest_str);
            
            int src = get_node_id(src_str);
            int dest = get_node_id(dest_str);
            
            if (is_reachable(src, dest)) {
                printf("yes\n");
            } else {
                printf("no\n");
            }
        }
    }

    return 0;
}