import java.io.*;
import java.util.*;

public class Main {

    static int n, m, t;
    static char[][] grid;
    static boolean[][][] allowed;
    static boolean[][] visited;

    static String answer = null;
    static boolean multiple = false;

    static int[] dr = {-1, 1, 0, 0};
    static int[] dc = {0, 0, -1, 1};

    static void dfs(int r, int c, int time, String word) {

        if (multiple) {
            return;
        }

        visited[r][c] = true;
        word = word + grid[r][c];

        // Reached the last character
        if (time == t) {

            if (answer == null) {
                answer = word;
            } else if (!answer.equals(word)) {
                multiple = true;
            }

            visited[r][c] = false;
            return;
        }

        // Try all 4 directions
        for (int d = 0; d < 4; d++) {

            int nr = r + dr[d];
            int nc = c + dc[d];

            if (nr < 0 || nr >= n || nc < 0 || nc >= m) {
                continue;
            }

            // Cannot revisit a cell
            if (visited[nr][nc]) {
                continue;
            }

            // Cell is excluded by a clue
            if (!allowed[time + 1][nr][nc]) {
                continue;
            }

            dfs(nr, nc, time + 1, word);

            if (multiple) {
                break;
            }
        }

        visited[r][c] = false;
    }

    public static void main(String[] args) throws Exception {

        BufferedReader br =
                new BufferedReader(new InputStreamReader(System.in));

        // N M
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());

        grid = new char[n][m];

        // Grid
        for (int i = 0; i < n; i++) {

            st = new StringTokenizer(br.readLine());

            for (int j = 0; j < m; j++) {
                grid[i][j] = st.nextToken().charAt(0);
            }
        }

        // Length of secret key
        t = Integer.parseInt(br.readLine().trim());

        // Number of clues
        int clues = Integer.parseInt(br.readLine().trim());

        /*
         * allowed[time][row][column]
         *
         * true  = cell can be used
         * false = cell is excluded by clue
         */
        allowed = new boolean[t + 1][n][m];

        for (int time = 1; time <= t; time++) {
            for (int r = 0; r < n; r++) {
                Arrays.fill(allowed[time][r], true);
            }
        }

        // Read clues
        for (int i = 0; i < clues; i++) {

            int time = Integer.parseInt(br.readLine().trim());

            st = new StringTokenizer(br.readLine());

            int x1 = Integer.parseInt(st.nextToken()) - 1;
            int y1 = Integer.parseInt(st.nextToken()) - 1;
            int x2 = Integer.parseInt(st.nextToken()) - 1;
            int y2 = Integer.parseInt(st.nextToken()) - 1;

            for (int r = x1; r <= x2; r++) {
                for (int c = y1; c <= y2; c++) {
                    allowed[time][r][c] = false;
                }
            }
        }

        /*
         * Check whether every time has at least one
         * possible cell.
         */
        for (int time = 1; time <= t; time++) {

            boolean possible = false;

            for (int r = 0; r < n && !possible; r++) {
                for (int c = 0; c < m; c++) {

                    if (allowed[time][r][c]) {
                        possible = true;
                        break;
                    }
                }
            }

            if (!possible) {
                System.out.println("Not enough clues");
                return;
            }
        }

        visited = new boolean[n][m];

        /*
         * Try every possible starting position.
         */
        for (int r = 0; r < n; r++) {

            for (int c = 0; c < m; c++) {

                if (!allowed[1][r][c]) {
                    continue;
                }

                dfs(r, c, 1, "");

                if (multiple) {
                    System.out.println("Not enough clues");
                    return;
                }
            }
        }

        // No valid path
        if (answer == null) {
            System.out.println("Not enough clues");
        } else {
            System.out.println(answer);
        }
    }
}