const aboutBtn = document.getElementById('about');
const aboutDiv = document.getElementById('aboutDiv');

const cgb = document.getElementById('createGraphButton'); // Create graph button
const graphGenMenu = document.getElementById('sourceInput') 

const graphInputField = document.getElementById('edges'); // Edge list
const graphInputVertices = document.getElementById('vertices'); // Vertices
const connected = document.getElementById('connectedGraph'); // Connected graph checkbox
const minWeight = document.getElementById('minWeight'); // Minimum weight input
const maxWeight = document.getElementById('maxWeight'); // Maximum weight input
const vertexInput = document.getElementById('numNodes'); // Number of vertices input
const edgeInput = document.getElementById('numEdges'); // Number of edges input
const generateRandomButton = document.getElementById('generateRandomGraph'); // Generate random graph button

const selfLoops = document.getElementById('selfLoops');
const duplicateEdges = document.getElementById('duplicateEdges');
const isDirected = document.getElementById('directed');

const outliner = document.querySelector('.outliner'); // Outliner - Contains created graphs

const view4 = document.getElementById('view4'); // View 4 button
const view9 = document.getElementById('view9'); // View 9 button
let view4gen = false; // View 4 generation state
let view9gen = false; // View 9 generation state

const snap = document.getElementById('snap'); // Snapping for 4 and 9 graph view
let snapping = false; // Snapping state

const showHideAll = document.getElementById('showHideAll'); // Show/Hide All graphs button
let showHideAllGraphs = true; // Show/Hide All graphs state

const clearAll = document.getElementById('clearAll'); // Clear All graphs button

let edgeColor = getComputedStyle(document.documentElement).getPropertyValue('--edge-color').trim();
let edgeHoverColor = getComputedStyle(document.documentElement).getPropertyValue('--edge-hover-color').trim();
let nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--node-color').trim();
let nodeHoverColor = getComputedStyle(document.documentElement).getPropertyValue('--node-hover-color').trim();
let nodeLabelColor = getComputedStyle(document.documentElement).getPropertyValue('--node-label-color').trim();
let edgeWeightColor = getComputedStyle(document.documentElement).getPropertyValue('--edge-weight-color').trim();
let gridLineColor = getComputedStyle(document.documentElement).getPropertyValue('--grid-line-color').trim();
let dragNodeColor = getComputedStyle(document.documentElement).getPropertyValue('--drag-node-color').trim();

// Available methods
const algorithms = [
    { name: 'bfs', text: 'BFS', title: 'Breadth-First Search' },
    { name: 'dfs', text: 'DFS', title: 'Depth-First Search' },
    { name: 'dijkstra', text: 'Dijkstra\'s', title: 'Dijkstra\'s Shortest Path' },
    { name: 'floydWarshall', text: 'Floyd Warshall', title: 'Floyd-Warshall Algorithm' },
    { name: 'bellmanFord', text: 'Bellman Ford', title: 'Bellman-Ford Algorithm' },
    { name: 'mst', text: 'MST', title: 'Minimum Spanning Tree' },
    { name: 'topologicalSort', text: 'Topological Sort', title: 'Topological Sorting' },
    { name: 'scc', text: 'SCC', title: 'Strongly Connected Components' },
    { name: 'bcc', text: 'BCC', title: 'Biconnected Components' }
];

// Drawing grid
const gridSize = 40; // Defines the distance between lines

// SVG panning variables
let isSvgPanning = false;
let panStartX, panStartY;

// Fullscreen mode variables
let isFullScreen = false;
let oldContainerWidth, oldContainerHeight, oldContainerLeft, oldContainerTop;

// Graph management variables
let graphCount = 0;
let availableGraphs = [];