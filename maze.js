/**
 * Maze.js
 * Author: Kevin Reese
 *
 * Maze Generation Program
 *
 * This program implements maze generation, MST, and path finding algorithms to generate random mazes and solve them 
 * using JavaScript and HTML/CSS. It provides functionalities to generate and solve mazes using various algorithms and visualize
 * the maze generation process on a grid layout.
 */

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

let speed_factor = 500;
let num_cells = 9;
let num_rows = Math.sqrt(num_cells);
let num_columns = Math.sqrt(num_cells);
let visited = [];
let frontier = [];
let cells = [];

let grid_container = document.getElementById("grid-container");
let grid_drop = document.getElementById("grid-drop");
let alg_drop = document.getElementById("alg-drop");
let solve_alg_drop = document.getElementById("solve-alg-drop");
let reset_btn = document.getElementById("reset-btn");
let run_btn = document.getElementById("run-btn");
let solve_btn = document.getElementById("solve-btn");

document.addEventListener("DOMContentLoaded", GenerateGrid);
reset_btn.addEventListener("click", GenerateGrid);
run_btn.addEventListener("click", GenerateMaze);
solve_btn.addEventListener("click", SolveMaze);    
grid_drop.addEventListener("change", GenerateGrid);

/**
 * Generates new HTML grid depending on dropdown selection and updates sleep time.
 * 
 * @param {number} num_cells - Number of cells to be in the grid.
 */
function GenerateGrid(num_cells) {
    cells = [];

    solve_alg_drop.disabled = true;
    solve_btn.disabled = true;
    solve_btn.style.backgroundColor = "rgb(125, 125, 125)";
    run_btn.disabled = false;
    run_btn.style.backgroundColor = "rgb(0, 0, 0)";

    while (grid_container.firstChild) {
        grid_container.removeChild(grid_container.lastChild);
    }
    
    switch (grid_drop.value) {
        case "0":
            num_cells = 9;
            speed_factor = 500;
            document.getElementById("grid-container").style.gridTemplateColumns = "repeat(3, 1fr)";
            break;
        case "1":
            num_cells = 25;
            speed_factor = 50;
            document.getElementById("grid-container").style.gridTemplateColumns = "repeat(5, 1fr)";

            break;
        case "2":
            num_cells = 100;
            speed_factor = 40;
            document.getElementById("grid-container").style.gridTemplateColumns = "repeat(10, 1fr)";

            break;
        case "3":
            num_cells = 625;
            speed_factor = 5;
            document.getElementById("grid-container").style.gridTemplateColumns = "repeat(25, 1fr)";
            break;
        case "4":
            num_cells = 1600;
            speed_factor = 0.0001;
            document.getElementById("grid-container").style.gridTemplateColumns = "repeat(40, 1fr)";
            break;
        default:
            throw new Error('Maze dimensions not found!');
    }

    num_rows = Math.sqrt(num_cells);
    num_columns = num_rows;

    for (let i = 0; i < num_cells; i++) {
        let grid_item = document.createElement("div");
        grid_item.classList.add("grid-item");
        grid_item.id = "grid-item" + i;
        grid_container.appendChild(grid_item);
    }

    visited = Array(num_cells).fill(false);

    for (let i = 0; i < num_rows; i++) {
        for (let j = 0; j < num_columns; j++) cells.push([i,j]);
    }
}

/**
 * Creates a maze using the chosen algorithm (Kruskal's, Recursive Backtracking, or Prim's). 
 * After generation is finished, UI controls are restored and maze entrances and exits are created.
 * 
 */
async function GenerateMaze() {
    run_btn.disabled = true;
    run_btn.style.backgroundColor = "rgb(125, 125, 125)";
    reset_btn.disabled = true;
    reset_btn.style.backgroundColor = "rgb(125, 125, 125)";
    grid_drop.disabled = true;
    
    let startRow = Math.floor(Math.random() * num_rows);
    let startColumn = Math.floor(Math.random() * num_columns);
    visited[FindCellIndex([startRow, startColumn], cells)] = true;

    if (alg_drop.value == "0") {
        await PrimsAlgorithm(startRow, startColumn);
    } else if (alg_drop.value == "1") {
        let path = [];
        path.push([startRow, startColumn]);
        await RecursiveBacktrack(path);
    } else if (alg_drop.value == "2") {
        await Kruskals();
    }

    reset_btn.disabled = false;
    reset_btn.style.backgroundColor = "rgb(0, 0, 0)";
    grid_drop.disabled = false;
    solve_btn.disabled = false;
    solve_btn.style.backgroundColor = "rgb(0, 0, 0)";
    solve_alg_drop.disabled = false;
    
    CreateEntranceAndExit();
}

/**
 * Finds the adjacent neighbors (N,E,S,W) of a cell in the maze grid based on its row and column.
 *
 * @param {number} row - The row index of the cell.
 * @param {number} column - The column index of the cell.
 * 
 * @return {number[][]} 2D array containing the coordinates of the neighboring cells.
 */
function Neighbors(row, column) {
    let neighbors = [];
    if (row - 1 >= 0) neighbors.push([row - 1, column]);
    if (column + 1 < num_columns) neighbors.push([row, column + 1]);
    if (row + 1 < num_rows) neighbors.push([row + 1, column]);
    if (column - 1 >= 0) neighbors.push([row, column - 1]);
    return neighbors;
}

/**
 * Randomized Prim's algorithm used to generate the maze. Randomly choose cells from the frontier and
 * expanding from a randomly chosen starting point.
 */
async function PrimsAlgorithm(startRow, startColumn) {
    let neighbors = Neighbors(startRow, startColumn);
    let idx = -1;

    for (let neighbor of neighbors) {
        idx = FindCellIndex(neighbor, cells);
        document.getElementById("grid-item" + idx).style.backgroundColor = "rgb(255, 200, 200)";
        frontier.push(neighbor);
    }
    document.getElementById("grid-item" + FindCellIndex([startRow, startColumn], cells)).style.backgroundColor = "rgb(255, 240, 240)";
    await sleep(speed_factor);

    while (frontier.length > 0) {
        let randomCell = frontier[Math.floor(Math.random() * (frontier.length))];
        let randomCellIdx = FindCellIndex(randomCell, frontier);
        frontier.splice(randomCellIdx, 1);

        let randCellNeighbors = Neighbors(randomCell[0], randomCell[1]);
        let randCellVisitedNeighbors = [];
        for (let neighbor of randCellNeighbors) {
            if (visited[FindCellIndex(neighbor, cells)]) randCellVisitedNeighbors.push(neighbor);
        }

        let randomVisitedNeighbor = randCellVisitedNeighbors[Math.floor(Math.random() * randCellVisitedNeighbors.length)]
        CutEdge(randomCell, randomVisitedNeighbor);
        document.getElementById("grid-item" + FindCellIndex(randomCell, cells)).style.backgroundColor = "rgb(255, 240, 240)";
        await sleep(speed_factor);

        visited[FindCellIndex(randomCell, cells)] = true;

        for (let neighbor of randCellNeighbors) {
            if (!visited[FindCellIndex(neighbor, cells)] && (FindCellIndex(neighbor, frontier)) < 0) {
                frontier.push(neighbor);
                document.getElementById("grid-item" + FindCellIndex(neighbor, cells)).style.backgroundColor = "rgb(255, 200, 200)";
            }
        }
        await sleep(speed_factor);
    }
}

/** 
 * Kruskal's algorithm used to generate the maze. Select edges at random which do not create a loop, 
 * continuing until all cells are connected.
 * 
 */
async function Kruskals() {
    let edges = GetAllEdges();
    let cellMap = [];

    for (let i = 0; i < cells.length; i++) 
        cellMap.push({x: cells[i][0], y: cells[i][1], set: i});

    do {
        let edge = edges[Math.floor(Math.random() * edges.length)];
        edges.splice(edges.indexOf(edge), 1);
        let cell1, cell2;
        for (let cell of cellMap) {
            if (cell.x == edge[0][0] && cell.y == edge[0][1]) cell1 = cell;
            if (cell.x == edge[1][0] && cell.y == edge[1][1]) cell2 = cell;
        }

        if (cell1.set != cell2.set) {
            let oldSet = cell2.set;
            for (let cell of cellMap) {
                if (cell.set == oldSet) cell.set = cell1.set;
            }
            document.getElementById("grid-item" + FindCellIndex([cell1.x, cell1.y], cells)).style.backgroundColor = "rgb(255, 240, 240)";
            document.getElementById("grid-item" + FindCellIndex([cell2.x, cell2.y], cells)).style.backgroundColor = "rgb(255, 240, 240)";
            CutEdge([cell1.x, cell1.y], [cell2.x, cell2.y]);
            await sleep(speed_factor);
        }        
    } while (edges.length > 0);
}

/**
 * Retrieve all edges between adjacent cells in the grid.
 * 
 * @returns {number[][]} Array of edges where each edge is a pair of coordinates.
 */
function GetAllEdges() {
    let edges = [];
    for (let x = 0; x < num_rows; x++) {
        for (let y = 0; y < num_columns; y++) {
            if (x < num_rows - 1) edges.push([[x, y], [x + 1, y]]);
            if (y < num_columns - 1) edges.push([[x, y], [x, y + 1]]);
        }
    }
    return edges;
}

/**
 * Randomized Depth-First Search algorithm used to generate the maze.
 * 
 * @param {number[][]} path - A Stack with the current random path
 */
async function RecursiveBacktrack(path) {
    if (path.length > 0) {
        let current = path[path.length - 1];
        let idx = FindCellIndex(current, cells);
        document.getElementById("grid-item" + idx).style.backgroundColor = "rgb(255, 200, 200)";
        await sleep(speed_factor);

        let unvisitedNeighbors = [];
        for (let neighbor of Neighbors(current[0], current[1])) {
            if (!visited[FindCellIndex(neighbor, cells)]) unvisitedNeighbors.push(neighbor);
        }

        if (unvisitedNeighbors.length > 0) {
            let randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
            CutEdge(randomNeighbor, current);
            visited[FindCellIndex(randomNeighbor, cells)] = true;
            path.push(randomNeighbor);
        } else {
            let cell = path.pop();
            document.getElementById("grid-item" + FindCellIndex(cell, cells)).style.backgroundColor = "rgb(255, 240, 240)";
        }

        RecursiveBacktrack(path);
    }
}

/**
 * Solves the maze with the selected algorithm.
 */
function SolveMaze() {
    if (solve_alg_drop.value == "0") {
        Dijkstras();
    } 
}

/**
 * Remove border at entrance and exit cells.
 */
function CreateEntranceAndExit() {
    let entrance = [num_rows - 1, num_columns - 1], exit = [0, 0];
    document.getElementById("grid-item" + FindCellIndex(entrance, cells)).style.borderBottomColor = "transparent";
    document.getElementById("grid-item" + FindCellIndex(exit, cells)).style.borderTopColor = "transparent";
}

/**
 * Dijkstra's algorithm solves the maze by searching for shortest path to exit.
 * 
 */
async function Dijkstras() {
    let queue = [[0, 0, 0]];
    let depthMap = new Map([[0, 0]]);
    visited = Array(num_cells).fill(false);

    // Assign depth to each cell using BFS
    while (queue.length > 0) {
        let cell = queue.shift();
        let idx = FindCellIndex([cell[0], cell[1]], cells);
        let depth = depthMap.get(idx);
        visited[idx] = true;
        document.getElementById("grid-item" + idx).style.backgroundColor = "#5941f6";
        if (cell[0] == num_rows - 1 && cell[1] == num_columns - 1) break;
        await sleep(speed_factor);

        for (let neighbor of ConnectedNeighbors(cell[0], cell[1])) {
            let neighborIdx = FindCellIndex(neighbor, cells);
            if (!visited[neighborIdx]) {
                document.getElementById("grid-item" + neighborIdx).style.backgroundColor = "#5941f6";
                await sleep(speed_factor);
                queue.push([neighbor[0], neighbor[1], depth + 1]);
                depthMap.set(neighborIdx, depth + 1);
            }
        }

    }
    
    // Traverse backwards through maze selecting next open cell with smaller depth
    let maxDepth = depthMap.get(num_rows * num_columns - 1);
    queue = [[num_rows - 1, num_columns - 1]];
    document.getElementById("grid-item" + FindCellIndex(queue[0], cells)).style.backgroundColor = "#c3b9ff";
    await sleep(speed_factor);

    while (queue.length > 0) {
        let current = queue.shift();
        for (let neighbor of ConnectedNeighbors(current[0], current[1])) {
            let neighborIdx = FindCellIndex(neighbor, cells);

            if (depthMap.get(neighborIdx) < maxDepth) {
                maxDepth = depthMap.get(neighborIdx);
                document.getElementById("grid-item" + neighborIdx).style.backgroundColor = "#c3b9ff";
                await sleep(speed_factor);
                queue.push(neighbor);
            }
        }
    }    
}

/**
 * Find the neighbors of the given cell that do not have a border between them (the maze has been generated).
 * 
 * @param {number} row - the row index of the cell.
 * @param {number} column - the column index of the cell.
 * @returns 2D array containing the coordinates of the neighboring cells.
 */
function ConnectedNeighbors(row, column) {
    let neighbors = [];
    let idx = FindCellIndex([row, column], cells);

    if (row - 1 >= 0 && document.getElementById("grid-item" + idx).style.borderTopColor == "transparent") 
        neighbors.push([row - 1, column]);
    if (column + 1 < num_columns && document.getElementById("grid-item" + idx).style.borderRightColor == "transparent") 
        neighbors.push([row, column + 1]);
    if (row + 1 < num_rows && document.getElementById("grid-item" + idx).style.borderBottomColor == "transparent") 
        neighbors.push([row + 1, column]);
    if (column - 1 >= 0 && document.getElementById("grid-item" + idx).style.borderLeftColor == "transparent") 
        neighbors.push([row, column - 1]);

    return neighbors;
}

/**
 * Cuts an edge between the randomly chosen cell and its neighboring cell in the maze.
 * Removes the borders of the cells to create a passage between them.
 *
 * @param {number[]} cell1 - Frontier cell from which the edge is cut.
 * @param {number[]} cell2 - Neighboring visited cell to which the edge is cut.
 */
function CutEdge(cell1, cell2) {
    let grid_cell2 = document.getElementById("grid-item" + FindCellIndex(cell2, cells));
    let grid_cell1 = document.getElementById("grid-item" + FindCellIndex(cell1, cells));

    if (cell1[1] - 1 == cell2[1]) {            // WEST
        grid_cell1.style.borderLeftColor = "transparent";
        grid_cell2.style.borderRightColor = "transparent";
    } else if (cell1[1] + 1 == cell2[1]) {     // EAST
        grid_cell1.style.borderRightColor = "transparent";
        grid_cell2.style.borderLeftColor = "transparent";
    } else if (cell1[0] - 1 == cell2[0]) {     // NORTH
        grid_cell1.style.borderTopColor = "transparent";
        grid_cell2.style.borderBottomColor = "transparent";
    } else if (cell1[0] + 1 == cell2[0]) {     // SOUTH 
        grid_cell1.style.borderBottomColor = "transparent";
        grid_cell2.style.borderTopColor = "transparent";
    }
}

/**
 * Finds the index of a cell within the specified 2D array.
 *
 * @param {number[]} cell - The cell whose index needs to be found.
 * @param {number[][]} array - The 2D array in which to search for the cell.
 * 
 * @return {number} The index of the cell in the array if found, otherwise -1
 */
function FindCellIndex(cell, array) {
    for (let i = 0; i < array.length; i++) {
        if (ArraysEqual(array[i], cell)) return i;
    }
    return -1;
}

/**
 * Checks if two arrays are equal by comparing their elements.
 *
 * @param {number[]} arr1 - The first array to compare.
 * @param {number[]} arr2 - The second array to compare.
 * 
 * @return {boolean} True if the arrays have the same length and all elements are equal, false otherwise.
 */
function ArraysEqual(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) return false;
    }
    return true;
}


/**
 * Pauses program execution for specified amount of time.
 *
 * @param {number} delay - time to sleep for in milliseconds.
 */
function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}


