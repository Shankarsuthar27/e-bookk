#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Structure to hold a placement command
typedef struct {
    int e;          // Existing cube
    int n;          // New cube
    char dir[10];   // Direction
} Command;

// Comparator to sort commands by existing_cube (ascending), then new_cube (ascending)
int compare_commands(const void *a, const void *b) {
    Command *cmd1 = (Command *)a;
    Command *cmd2 = (Command *)b;
    if (cmd1->e != cmd2->e) {
        return cmd1->e - cmd2->e;
    }
    return cmd1->n - cmd2->n;
}

int main() {
    int num_cmds;
    if (scanf("%d", &num_cmds) != 1) {
        return 0;
    }

    Command *cmds = (Command *)malloc(num_cmds * sizeof(Command));
    for (int i = 0; i < num_cmds; i++) {
        scanf("%d %d %s", &cmds[i].e, &cmds[i].n, cmds[i].dir);
    }

    // Order the commands prior to processing
    qsort(cmds, num_cmds, sizeof(Command), compare_commands);

    // 2D grid mapping (0 implies empty). 200x200 is more than enough for up to 50 cubes.
    int grid[200][200];
    memset(grid, 0, sizeof(grid));

    int pos_r[105] = {0};
    int pos_c[105] = {0};
    int placed[105] = {0};

    // Process the commands
    for (int i = 0; i < num_cmds; i++) {
        int e = cmds[i].e;
        int n = cmds[i].n;
        char *dir = cmds[i].dir;

        // If the existing cube hasn't been placed yet, it's the root of our structure.
        // We place it at the center of our bounding grid.
        if (!placed[e]) {
            placed[e] = 1;
            pos_r[e] = 100;
            pos_c[e] = 100;
            grid[100][100] = e;
        }

        int r = pos_r[e];
        int c = pos_c[e];
        int nr = r;
        int nc = c;

        // Determine coordinates based on direction 
        // Note: top means moving up a row (r - 1)
        if (strcmp(dir, "top") == 0) {
            nr = r - 1;
        } else if (strcmp(dir, "down") == 0) {
            nr = r + 1;
        } else if (strcmp(dir, "left") == 0) {
            nc = c - 1;
        } else if (strcmp(dir, "right") == 0) {
            nc = c + 1;
        }

        // Place the new cube and log its position
        grid[nr][nc] = n;
        pos_r[n] = nr;
        pos_c[n] = nc;
        placed[n] = 1;
    }

    int target;
    if (scanf("%d", &target) != 1) {
        free(cmds);
        return 0;
    }

    if (!placed[target]) {
        printf("-1 -1 -1 -1\n");
    } else {
        int r = pos_r[target];
        int c = pos_c[target];

        // Retrieve adjacent sides: Up, Down, Left, Right
        int up    = (grid[r - 1][c] == 0) ? -1 : grid[r - 1][c];
        int down  = (grid[r + 1][c] == 0) ? -1 : grid[r + 1][c];
        int left  = (grid[r][c - 1] == 0) ? -1 : grid[r][c - 1];
        int right = (grid[r][c + 1] == 0) ? -1 : grid[r][c + 1];

        printf("%d %d %d %d\n", up, down, left, right);
    }

    free(cmds);
    return 0;
}
