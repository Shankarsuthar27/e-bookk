#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>

using namespace std;

// Structure to store each command details
struct Command {
    int ext, new_cube;
    string dir;
    
    // Custom comparator to sort ascendingly by existing cube, then new cube
    bool operator<(const Command& other) const {
        if (ext != other.ext) {
            return ext < other.ext;
        }
        return new_cube < other.new_cube;
    }
};

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int N;
    if (!(cin >> N)) return 0;
    
    vector<Command> commands(N);
    for (int i = 0; i < N; ++i) {
        cin >> commands[i].ext >> commands[i].new_cube >> commands[i].dir;
    }
    
    int query;
    cin >> query;
    
    // Sort commands as per instruction constraints
    sort(commands.begin(), commands.end());
    
    map<int, pair<int, int>> cube_to_pos;
    map<pair<int, int>, int> pos_to_cube;
    
    if (N > 0) {
        // Place the origin root cube at relative coordinate (0, 0)
        int first_ext = commands[0].ext;
        cube_to_pos[first_ext] = {0, 0};
        pos_to_cube[{0, 0}] = first_ext;
    } else {
        cout << "-1 -1 -1 -1\n";
        return 0;
    }
    
    // Process Sorted Commands
    for (int i = 0; i < N; ++i) {
        int ext = commands[i].ext;
        int new_cube = commands[i].new_cube;
        string dir = commands[i].dir;
        
        // Safety bound: Ensure the existing structure connects properly
        if (cube_to_pos.find(ext) == cube_to_pos.end()) {
            continue;
        }
        
        int ex = cube_to_pos[ext].first;
        int ey = cube_to_pos[ext].second;
        
        // Calculate new coordinate based on offset 
        int nx = ex, ny = ey;
        if (dir == "top") {
            ny -= 1;
        } else if (dir == "down") {
            ny += 1;
        } else if (dir == "left") {
            nx -= 1;
        } else if (dir == "right") {
            nx += 1;
        }
        
        pair<int, int> new_pos = {nx, ny};
        
        // Prevent floating identifiers if the new_cube was already mapped elsewhere
        if (cube_to_pos.find(new_cube) != cube_to_pos.end()) {
            pair<int, int> old_pos = cube_to_pos[new_cube];
            pos_to_cube.erase(old_pos);
        }
        
        // If a new cube is placed where another already exists, the old one is replaced
        if (pos_to_cube.find(new_pos) != pos_to_cube.end()) {
            int old_cube = pos_to_cube[new_pos];
            cube_to_pos.erase(old_cube);
        }
        
        // Map the new layout
        pos_to_cube[new_pos] = new_cube;
        cube_to_pos[new_cube] = new_pos;
    }
    
    // Verification Phase
    if (cube_to_pos.find(query) == cube_to_pos.end()) {
        cout << "-1 -1 -1 -1\n";
    } else {
        int qx = cube_to_pos[query].first;
        int qy = cube_to_pos[query].second;
        
        // Probe all 4 adjacent sides 
        int up = pos_to_cube.find({qx, qy - 1}) != pos_to_cube.end() ? pos_to_cube[{qx, qy - 1}] : -1;
        int down = pos_to_cube.find({qx, qy + 1}) != pos_to_cube.end() ? pos_to_cube[{qx, qy + 1}] : -1;
        int left = pos_to_cube.find({qx - 1, qy}) != pos_to_cube.end() ? pos_to_cube[{qx - 1, qy}] : -1;
        int right = pos_to_cube.find({qx + 1, qy}) != pos_to_cube.end() ? pos_to_cube[{qx + 1, qy}] : -1;
        
        cout << up << " " << down << " " << left << " " << right << "\n";
    }
    
    return 0;
}