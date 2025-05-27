/* This file contains the functionality to add the graph windows and generate graphs in it, and also calling applicable methods on graphs. */

/* Already available data:
1. const containerAll
2. const outliner
3. const view4gen
4. const view9gen
*/
// Global variables
let graphCount = 0;
let availableGraphs = [];

// Graph style details
const edgeColor = '#a3bf60'; // Color of the links between nodes
const edgeColorHover = '#9e7bb0'; // Color of the links when hovered on
const hoverColor = '#7a9ec2'; // Color of nodes when hovered on
const nodeColor = '#ffc66d'; // Color of the nodes
const nodeLabelColor = '#000'; // Color of the text on the nodes
const edgeWeightColor = '#fff'; // Color of the edge weights
const gridLineColor = '#3c3d3c'; // Color of the grid lines
const dragNodeColor = '#7a9ec2'; // Color of the nodes when dragged

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

/* Applicable methods */
function filterAlgorithms(algorithms, directed, weighted) {
    // Filter the algorithms based on the graph properties
    const applicableAlgorithms = algorithms.filter(algorithm => {
        if (!directed) {
            // If the graph is undirected, exclude algorithms that only work on directed graphs
            if (algorithm.name === 'topologicalSort' || algorithm.name === 'scc') {
                return false;
            }
        }
        if (!weighted) {
            // If the graph is unweighted, exclude algorithms that require weighted graphs
            if (algorithm.name === 'dijkstra' || algorithm.name === 'floydWarshall' || algorithm.name === 'bellmanFord') {
                return false;
            }
        }
        return true;
    });
    return applicableAlgorithms;
}
/* End of Applicable methods */

// Functions exclusive to container
function focusOnThisContainer(container) {
    document.querySelectorAll('.graphContainer').forEach(c => {
        c.style.zIndex = 1;
        c.style.boxShadow = 'none';
    });
    container.style.zIndex = 999;
    container.style.boxShadow = '0px 0px 16px rgba(0, 0, 0, 0.5)';
}
// Focus and center this container
function focusAndCenterContainer(container, resize = true, fromCenter = false, oldLeft = null, oldTop = null) {
    if (resize) {
        container.style.height = '50%';
        container.style.width = '37.5%';
    }
    const offsetX = container.offsetWidth / 2;
    const offsetY = container.offsetHeight / 2;

    if (oldLeft !== null && oldTop !== null) {
        container.style.left = oldLeft + 'px';
        container.style.top = oldTop + 'px';
    } else {
        if (!fromCenter) {
            container.style.left = 'calc(37.5% - ' + offsetX + 'px)';
        } else {
            container.style.left = 'calc(50% - ' + offsetX + 'px)';
        }
        container.style.top = 'calc(50% - ' + offsetY + 'px)';
    }
    focusOnThisContainer(container)
}

function snapPosition(x, y) {
    let parentWidth = document.body.offsetWidth;
    let parentHeight = document.body.offsetHeight;

    if (snapping && view4gen) {
        let snapX = (x / parentWidth) < 0.1875 ? 0 : 0.375 * parentWidth;
        let snapY = (y / parentHeight) < 0.25 ? 0 : 0.5 * parentHeight;
        return [snapX, snapY];
    }
    else if (snapping && view9gen) {
        let snapXValues = [0, 0.25, 0.50].map(val => val * parentWidth);
        let snapYValues = [0, 0.3333, 0.6666].map(val => val * parentHeight);

        let snapX = snapXValues.reduce((prev, curr) =>
            Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
        );
        let snapY = snapYValues.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );
        return [snapX, snapY];
    }

    return [x, y];
}

function setContainerPosition(e, container) {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.closest('button')) return;
    e.preventDefault();

    let offsetX = e.clientX - container.offsetLeft;
    let offsetY = e.clientY - container.offsetTop;

    function setSnappedContainerPosition(event) {
        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;
        let [snapX, snapY] = snapPosition(x, y);
        container.style.left = `${snapX}px`;
        container.style.top = `${snapY}px`;
    }

    document.addEventListener('mousemove', setSnappedContainerPosition);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', setSnappedContainerPosition);
    }, { once: true });
}

function parseEdges(edgesInput) {
    let edgesRaw = edgesInput.split(',').map(edge => {
        edge = edge.trim();

        // Validate the edge format
        const simpleFormat = /^([a-zA-Z0-9]{2})(\d+)$/; // Matches 'ab5'
        const parenFormat = /^\(([a-zA-Z0-9]+)_([a-zA-Z0-9]+)_(\d+)\)$/; // Matches '(a_b_5)'

        let source, target, weight;

        if (simpleFormat.test(edge)) {
            const match = edge.match(simpleFormat);
            source = match[1][0];
            target = match[1][1];
            weight = parseFloat(match[2]);
        } else if (parenFormat.test(edge)) {
            const match = edge.match(parenFormat);
            source = match[1];
            target = match[2];
            weight = parseFloat(match[3]);
        } else {
            alert("Invalid edge format: " + edge);
            return null;
        }

        if (isNaN(weight)) {
            alert(`Invalid weight in edge: ${edge}`);
            return null;
        }

        return { source, target, weight };
    }).filter(edge => edge !== null);
    return edgesRaw;
}

/* Functions to draw grid */
// Grid settings
const gridSize = 40; // Defines the distance between lines
// Function to draw infinite grid
function drawGrid(svg, grid) {
    const viewBox = svg.attr('viewBox').split(' ').map(Number);
    const [minX, minY, width, height] = viewBox;

    const startX = Math.floor(minX / gridSize) * gridSize;
    const startY = Math.floor(minY / gridSize) * gridSize;
    const endX = minX + width;
    const endY = minY + height;

    // Buffer size based on viewBox dimensions
    const buffer = Math.max(width, height);

    // Remove existing grid lines
    grid.selectAll('*').remove();

    // Draw vertical grid lines
    for (let x = startX - buffer; x < endX + buffer; x += gridSize) {
        grid.append('line')
            .attr('x1', x).attr('y1', minY - buffer)
            .attr('x2', x).attr('y2', endY + buffer)
            .attr('stroke', gridLineColor).attr('stroke-width', 1);
    }

    // Draw horizontal grid lines
    for (let y = startY - buffer; y < endY + buffer; y += gridSize) {
        grid.append('line')
            .attr('x1', minX - buffer).attr('y1', y)
            .attr('x2', endX + buffer).attr('y2', y)
            .attr('stroke', gridLineColor).attr('stroke-width', 1);
    }
}
/* End of infinite grid */

// /* Function to draw finite grid */
// function drawGrid(width=1000, height=1000, svg) {
//     // Remove any existing grid lines
//     grid.selectAll('*').remove();

//     // Draw vertical grid lines
//     for (let x = 0; x <= width; x += gridSize) {
//         grid.append('line')
//             .attr('x1', x).attr('y1', 0)
//             .attr('x2', x).attr('y2', height)
//             .attr('stroke', '#cccccc77').attr('stroke-width', 1);
//     }

//     // Draw horizontal grid lines
//     for (let y = 0; y <= height; y += gridSize) {
//         grid.append('line')
//             .attr('x1', 0).attr('y1', y)
//             .attr('x2', width).attr('y2', y)
//             .attr('stroke', '#cccccc77').attr('stroke-width', 1);
//     }
// }
/* End of function to draw finite grid */
/* End of functions to draw grid */

/* Viewbox adjustment to center the graph */
// Adjust viewbox to fit the graph
function adjustViewBox(svg, nodes, grid) { // Takes grid as a parameter to redraw the grid
    const xValues = nodes.map(d => d.x);
    const yValues = nodes.map(d => d.y);
    const padding = 50;
    const minX = Math.min(...xValues) - padding;
    const maxX = Math.max(...xValues) + padding;
    const minY = Math.min(...yValues) - padding;
    const maxY = Math.max(...yValues) + padding;

    const viewWidth = maxX - minX;
    const viewHeight = maxY - minY;

    svg.attr('viewBox', `${minX} ${minY} ${viewWidth} ${viewHeight}`);
    drawGrid(svg, grid);
}
/* End of viewbox adjustment */

/* Function to align edges */
function setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId) {
    link.attr('d', d => {
        // Arc bidirectional edges
        if (d.bidirectional) {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Arc radius
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        }
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
    });

    if (directed) {
        if (link.attr('class') === 'link') {
            link.each(function (d) {
                const path = d3.select(this);
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const length = Math.sqrt(dx * dx + dy * dy); // Arc radius

                // Calculate the tangent angle at the end of the arc - used to rotate directed markers based on the edge curving
                const angle = Math.atan2(dy, dx) + Math.PI / (smoothFunction(length));

                // Create a unique marker ID for each arrow
                const uniqueArrowId = `${arrowId}-${d.source.id}-${d.target.id}`;

                // Append a unique marker for this edge if it doesn't already exist
                if (!svg.select(`#${uniqueArrowId}`).node()) {
                    svg.append('defs')
                        .append('marker')
                        .attr('id', uniqueArrowId)
                        .attr('viewBox', '0 -5 10 10')
                        .attr('refX', 25)
                        .attr('refY', 0)
                        .attr('markerWidth', 8)
                        .attr('markerHeight', 8)
                        .attr('orient', 'auto')
                        .append('path')
                        .attr('d', 'M0,-5L10,0L0,5')
                        .attr('fill', edgeColor);
                }

                // Update the marker-end attribute of the path to use the unique marker to match the curve of bidirectional edge
                path.attr('marker-end', `url(#${uniqueArrowId})`);

                // Update the orient attribute of the unique marker
                if (d.bidirectional) {
                    svg.select(`#${uniqueArrowId}`)
                        .attr('orient', angle * (180 / Math.PI)); // Convert radians to degrees
                }
            });
        }

        // Add weights if weighted
        if (weighted) {
            edgeLabel
                .attr('x', d => {
                    const midpointX = (d.source.x + d.target.x) / 2;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    if (d.bidirectional) {
                        const offsetX = Math.sin(angle) * length / 10;
                        return midpointX + offsetX;
                    }
                    return midpointX;
                })
                .attr('y', d => {
                    const midpointY = (d.source.y + d.target.y) / 2;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    if (d.bidirectional) {
                        const offsetY = -Math.cos(angle) * length / 10;
                        return midpointY + offsetY;
                    }
                    return midpointY;
                });
        }

        node.attr('cx', d => d.x).attr('cy', d => d.y);
        label.attr('x', d => d.x).attr('y', d => d.y);
    }
}
/* End of align edges */

function setMethodsElementSize(container, element) {
    // const containerLeft = container.offsetLeft;
    // const containerTop = container.offsetTop;
    // const containerWidth = container.offsetWidth;

    element.style.bottom = '2px';
    element.style.left = '2px';
    element.style.width = 'calc(100% - 4px)';
    element.style.height = '30%';
}

// Function to enable force
function enableForceSimulation(simulation, edges, width, height) {
    simulation.force('charge', d3.forceManyBody().strength(-300)); // Charge force makes nodes repel each other
    simulation.force('link', d3.forceLink(edges).id(d => d.id).distance(300)); // Link force makes nodes connected by edges stay within a distance
    simulation.force('center', d3.forceCenter(width / 2, height / 2)); // Center force makes nodes gravitate towards the center
}

// Function to disable force
function disableForceSimulation(simulation) {
    // Setting forces to null will disable them
    simulation.force('charge', null);
    simulation.force('link', null);
    simulation.force('center', null);
}

// Function to even spaces nodes in a circle
function positionNodesInCircle(nodes, simulation, width, height) {
    disableForceSimulation(simulation); // Disable force simulation when auto-rearranging nodes
    simulation.alphaDecay(1);
    simulation.alphaTarget(0);
    radius = 30 * nodes.length;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, index) => {
        node.x = width / 2 + radius * Math.cos(index * angleStep);
        node.y = height / 2 + radius * Math.sin(index * angleStep);
    });
}

/* Drag Functions - Move nodes */
function dragStarted(event, d, simulation, thisNode) {
    d3.select(thisNode).attr('fill', dragNodeColor);
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d, thisNode) {
    d3.select(thisNode).attr('fill', dragNodeColor);
    document.body.style.cursor = 'grabbing';
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d, simulation, useForce, thisNode) {
    d3.select(thisNode).attr('fill', nodeColor);
    document.body.style.cursor = 'default';
    if (!useForce) {
        simulation.alphaDecay(1);
    } else {
        simulation.alphaDecay(0.0228); // 0.0228 is the default alphaDecay value used in D3.
    }
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
/* End of Drag Functions */
// Supporting function that will be used to rotate arrows based on edge direction
function smoothFunction(x, k = 0.02, c = 275) {
    const exponent = -k * (x - c);
    const denominator = 1 + Math.exp(exponent);
    const result = 10 - (2 / denominator);
    return result;
}

function addGraph(edges = null, edgesRaw = null, inputName = null) { // Core function will all functionalities
    // Common arrow head ID for this graph
    const arrowId = `arrowHead${graphCount}`; // Creating separate arrow heads for each graph, while also grouping the similar ones
    graphCount++;

    // Graph name details
    if (inputName === null) {
        inputName = document.getElementById('graphName').value;
    }
    let displayName = inputName ? inputName : `Graph`; // Give a default name if the name field is empty
    let baseName = displayName;

    let counter = 1;
    while (availableGraphs.includes(displayName)) {
        displayName = `${baseName}.${String(counter).padStart(3, '0')}`;
        counter++;
    }
    availableGraphs.push(displayName); // Add the graph to the list of available graphs
    const titleName = displayName.length > 10 ? displayName.substring(0, 7) + '...' : displayName;

    // Graph value details
    edgesInput = document.getElementById('edges').value;
    const directed = document.getElementById('directed').checked;
    const weighted = document.getElementById('weighted').checked;

    // container is the graph window, and it contains the graph and svg functionalities.
    const container = document.createElement('div');
    document.body.appendChild(container); // Append the container initially to calculate child properties
    container.className = 'graphContainer';
    // Defining position and dimensions of the graph window here to check for grid view of the containers
    if (view9gen) {
        container.style.width = '25%';
        container.style.height = '33.33%';
    } else {
        container.style.width = '37.5%';
        container.style.height = '50%';
    }

    // Container that is interacted with will have the highest z-index
    container.addEventListener('mousedown', () => {
        focusOnThisContainer(container);
    });
    // Create the resize handles for the container
    const resizeHandleElements = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    resizeHandleElements.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.classList.add(corner);
        handle.setAttribute('data-corner', corner);
        container.appendChild(handle);
    });

    /* Content of container */
    // Create the graphHeader div - contains the graph name, use force checkbox, show grid checkbox, auto-rearrange radius input, and auto-rearrange button, and close button (The entire window functionality)
    const graphHeader = document.createElement('div');
    graphHeader.className = 'graphHeader';

    /* Graph Header content */
    // Create the span element - contains the graph name, use force checkbox, show grid checkbox, and Rearrange button
    const headerSpan = document.createElement('span');

    /* Header span content */
    // Create a new span for the graph name
    const graphNameSpan = document.createElement('span');
    graphNameSpan.style.fontWeight = 'bold';
    graphNameSpan.style.cursor = 'default';
    graphNameSpan.textContent = titleName;
    graphNameSpan.title = displayName; // Add title attribute to display full name on hover
    graphNameSpan.id = `${displayName}span`;
    headerSpan.appendChild(graphNameSpan);

    // Create the "Use Force" checkbox
    const useForceCheckbox = document.createElement('input');
    useForceCheckbox.type = 'checkbox';
    useForceCheckbox.title = 'Apply a force when dragging a node to affect other nodes';
    useForceCheckbox.checked = false;
    headerSpan.appendChild(useForceCheckbox);
    headerSpan.appendChild(document.createTextNode('Use Force'));

    // Create the "Show grid" checkbox
    const gridCheckbox = document.createElement('input');
    gridCheckbox.type = 'checkbox';
    gridCheckbox.title = 'Show/Hide grid';
    gridCheckbox.checked = true;
    headerSpan.appendChild(gridCheckbox);
    headerSpan.appendChild(document.createTextNode('Show grid'));

    // Create a div for the rearrange nodes and applicable methods
    const rearrangeMethods = document.createElement('div');
    rearrangeMethods.className = 'rearrangeMethods';

    // Rearrange nodes button
    const rearrangeNodes = document.createElement('button');
    rearrangeNodes.title = 'Rearrange vertices spaced evenly in a circle';
    const rearrangeNodesImg = document.createElement('img');
    rearrangeNodesImg.src = 'rearrange.png';
    rearrangeNodes.appendChild(rearrangeNodesImg);
    rearrangeMethods.appendChild(rearrangeNodes);

    // Applicable methods button
    const methodsButton = document.createElement('button');
    methodsButton.title = 'Show available methods';
    methodsButton.innerHTML = '<b>&#8964;</b>';
    rearrangeMethods.appendChild(methodsButton);

    headerSpan.appendChild(rearrangeMethods);

    // Input Validation - Parse edges
    if (edges === null) {
        edges = parseEdges(edgesInput);
    }
    if (edgesRaw === null) {
        edgesRaw = parseEdges(edgesInput);
    }
    console.log("edgesraw", typeof(edgesRaw));
    console.log("edges", edges);
    if (edges.length === 0) {
        return;
    }
    const applicableAlgorithms = filterAlgorithms(algorithms, directed, weighted);
    // Create new div for available methods button
    /* Available methods */
    const methodsDiv = document.createElement('div');
    methodsDiv.className = 'methodsDiv';
    methodsDiv.style.display = 'none';

    // Create buttons for each applicable algorithm
    applicableAlgorithms.forEach(algorithm => {
        const button = document.createElement('button');
        button.id = algorithm.name;
        button.textContent = algorithm.text;
        button.title = algorithm.title;

        button.addEventListener('click', () => {
            let result;
            let resultContainer = document.createElement('p')
            switch (algorithm.name) {
                case 'bfs':
                    let bfsSource = prompt("Enter source vertex");
                    result = bfs(edgesRaw, bfsSource, directed);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">BFS with ${bfsSource} as source node: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'dfs':
                    let dfsSource = prompt("Enter source vertex");
                    result = dfs(edgesRaw, dfsSource || undefined, directed);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">DFS through ${displayName}${dfsSource ? ` with ${dfsSource} as source node` : ''}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                        methodsElement.scrollTop = methodsElement.scrollHeight; // Scroll to the bottom of the methodsElement
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'dijkstra':
                    let dijkstraSource = prompt("Enter source vertex");
                    result = dijkstra(edgesRaw, dijkstraSource, directed);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">Dijkstra's through ${displayName} with ${dijkstraSource} as source node: </font> <br> ${result} <br>`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'floydWarshall':
                    result = floydWarshall(edgesRaw);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">Floyd Warshall through ${displayName}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'bellmanFord':
                    let bellmanSource = prompt("Enter source vertex");
                    result = bellmanFord(edgesRaw, bellmanSource, directed);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">Bellman Ford through ${displayName} with ${bellmanSource} as source node: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'mst':
                    result = mst(edgesRaw);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">MST through ${displayName}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'topologicalSort':
                    result = topologicalSort(edgesRaw);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">Topological Sort through ${displayName}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'scc':
                    result = StronglyConnectedComponents(edgesRaw);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">SCC through ${displayName}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                case 'bcc':
                    result = BiconnectedComponents(edgesRaw);
                    if (result !== null) {
                        resultContainer.innerHTML = `<font style="color: #ffc66d;">BCC through ${displayName}: </font> ${result}`;
                        methodsElement.appendChild(resultContainer);
                        methodsElement.style.display = 'block';
                    } else {
                        resultContainer.remove();
                    }
                    break;
                default:
                    alert("Algorithm not implemented.");
            }
            methodsElement.scrollTop = methodsElement.scrollHeight; // Scroll to the bottom of the methodsElement
        });

        methodsDiv.appendChild(button);
    });

    headerSpan.appendChild(methodsDiv);

    // Right click to display available methods
    methodsButton.addEventListener('click', (event) => {
        methodsDiv.style.left = `${methodsButton.offsetLeft}px`;
        methodsElement.style.display = 'none'; // Hide methodsElement if it is visible
        methodsDiv.style.display = methodsDiv.style.display === 'none' ? 'block' : 'none';
        methodsDiv.addEventListener('mouseleave', () => {
            methodsDiv.style.display = 'none';
        }, { once: true });
    });


    headerSpan.appendChild(methodsDiv);
    /* End of Available methods */
    /* End of header span content */

    // Append the headerSpan to the graphHeader
    graphHeader.appendChild(headerSpan);

    // Create the controls div - contains the close button
    /* Controls */
    const controlsSpan = document.createElement('span');

    // Create the fullScreen button
    const fullScreenButton = document.createElement('button');
    fullScreenButton.innerHTML = '<b>&#9744;</b>';
    fullScreenButton.title = 'Toggle full screen';
    controlsSpan.appendChild(fullScreenButton);

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10005;';
    closeButton.title = 'Close graph';
    controlsSpan.appendChild(closeButton);
    /* End of Controls */

    // Append the controls div to the graphHeader
    graphHeader.appendChild(controlsSpan);
    /* End of graph header content */

    // Append the graphHeader to the container
    container.appendChild(graphHeader);

    /* Create the graphContent div - contains the SVG element and the methods called on the graph */
    const graphContent = document.createElement('div');
    graphContent.className = 'graphContent';
    graphContent.style.height = `calc(100% - ${graphHeader.offsetHeight}px)`; // Set the height of the graphContent to fill the remaining space

    // Create the SVG element
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // This is not a link to fetch data from. It is a namespace for creating elements.
    graphContent.appendChild(svgElement);
    /* End of graphContent div */

    // Create the element that contains called methods
    const methodsElement = document.createElement('div');
    methodsElement.className = 'methodsElem';
    methodsElement.addEventListener('wheel', (event) => {
        event.stopPropagation();
    })
    graphContent.appendChild(methodsElement);

    // Resizing for methodsElement
    const topResizeHandle = document.createElement('div');
    topResizeHandle.className = 'top-resize-handle';
    // Resizing logic
    topResizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        let startY = e.clientY;
        let startHeight = methodsElement.offsetHeight;
        let startTop = methodsElement.offsetTop;

        function onMouseMove(event) {
            let newHeight = startHeight - (event.clientY - startY);
            let newTop = startTop + (event.clientY - startY);

            const minHeight = container.offsetHeight * 0.2;
            const maxHeight = container.offsetHeight * 0.9;
            if (newHeight >= minHeight && newHeight <= maxHeight) { // Minimum height
                methodsElement.style.height = newHeight + 'px';
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    });
    // End of resizing for methodsElement
    methodsElement.appendChild(topResizeHandle);

    const copyr = document.createElement('div')
    copyr.style.display = 'inline-block';
    copyr.style.margin = '5px 0px 0px 10px';
    copyr.innerHTML = '© 2025 arx-net';
    methodsElement.appendChild(copyr);

    const closeButtonME = document.createElement('button');
    closeButtonME.id = 'closeButtonME'
    closeButtonME.innerHTML = '&#10005;';
    closeButtonME.title = 'Close graph methods window';
    closeButtonME.addEventListener('click', () => {
        methodsElementToggle.click();
    })
    methodsElement.appendChild(closeButtonME)



    const methodsElementToggle = document.createElement('button');
    methodsElementToggle.id = 'methodsElementToggle'
    methodsElementToggle.innerHTML = '&#9776'; // Hamburger menu
    methodsElementToggle.title = 'Toggle visibility for called methods on this graph'
    methodsElementToggle.addEventListener('click', () => {
        methodsElement.style.display = methodsElement.style.display === 'block' ? 'none' : 'block';
    })
    rearrangeMethods.appendChild(methodsElementToggle);

    // Append the graphContent to the container
    container.appendChild(graphContent);
    /* End of content of container */
    focusAndCenterContainer(container); // Focus on the container when it is created

    // Right clicking will display options to reset zoom, focus, hide, and delete graph.
    container.addEventListener('contextmenu', function (event) {
        event.preventDefault();

        if (
            event.target.closest('.link') ||
            event.target.closest('.link2') ||
            event.target.closest('.methodsDiv')
        ) {
            return;
        }

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'methodsDiv'
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        // Helper to add menu items
        function addMenuItem(label, title, onClick) {
            const item = document.createElement('button');
            item.textContent = label;
            item.title = title
            item.addEventListener('click', () => {
                onClick();
                menu.remove();
            });
            menu.appendChild(item);
        }

        // Reset zoom
        addMenuItem('Reset window zoom', 'Set the window size as it initially was', () => {
            if (view9gen) {
                container.style.width = '25%';
                container.style.height = '33.33%';
            } else {
                container.style.width = '37.5%';
                container.style.height = '50%';
            }
        });

        // Focus (center and bring to front)
        addMenuItem('Focus', 'Bring this window to the center of the screen', () => {
            focusAndCenterContainer(container);
        });

        // Hide container
        addMenuItem('Hide', 'Hide this graph', () => {
            showHideGraph.click();
        });

        // Delete container
        addMenuItem('Delete', 'Delete this graph', () => {
            deleteThisGraph.click()
        });

        // Remove menu on click elsewhere
        document.addEventListener('mousedown', function handler(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('mousedown', handler);
            }
        }, { once: true });

        document.body.appendChild(menu);
    });

    const resizeHandles = container.querySelectorAll('.resize-handle');

    /* Container elements' functionality */
    /* Drag functionality */
    graphHeader.addEventListener('mousedown', (e) => {
        setContainerPosition(e, container);
    });
    /* End of drag functionality */

    /* Resize functionality */
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (view4gen) {
                document.getElementById('view4').click(); // Disable resizing for 4 graph views
            } else if (view9gen) {
                document.getElementById('view9').click(); // Disable resizing for 9 graph views
            }

            let startX = e.clientX;
            let startY = e.clientY;
            let startWidth = container.offsetWidth;
            let startHeight = container.offsetHeight;
            let startLeft = container.offsetLeft;
            let startTop = container.offsetTop;
            let corner = handle.getAttribute('data-corner');

            function onMouseMove(event) {
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                if (corner.includes('right')) {
                    newWidth = startWidth + (event.clientX - startX);
                }
                if (corner.includes('left')) {
                    newWidth = startWidth - (event.clientX - startX);
                    newLeft = startLeft + (event.clientX - startX);
                }
                if (corner.includes('bottom')) {
                    newHeight = startHeight + (event.clientY - startY);
                }
                if (corner.includes('top')) {
                    newHeight = startHeight - (event.clientY - startY);
                    newTop = startTop + (event.clientY - startY);
                }

                const minWidth = window.innerWidth * 0.25
                const minHeight = window.innerHeight * 0.33
                const maxWidth = window.innerWidth;
                const maxHeight = window.innerHeight;
                if (newWidth > minWidth && newWidth < maxWidth) {
                    container.style.width = newWidth + 'px';
                    container.style.left = newLeft + 'px';
                }
                if (newHeight > minHeight && newHeight < maxHeight) {
                    container.style.height = newHeight + 'px';
                    container.style.top = newTop + 'px';
                    setMethodsElementSize(container, methodsElement);
                }
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    });
    /* End of resize functionality */

    // Full screen button
    let isFullScreen = false;
    let oldWidth, oldHeight, oldLeft, oldTop; // Variables to store the previous dimensions and position of the container
    fullScreenButton.addEventListener('click', () => {
        if (!isFullScreen) {
            oldWidth = container.style.width;
            oldHeight = container.style.height;
            oldLeft = container.offsetTop;
            oldTop = container.offsetTop;
        }
        if (!isFullScreen) {
            isFullScreen = true;
            container.style.width = window.innerWidth + 'px';
            container.style.height = window.innerHeight + 'px';
            focusAndCenterContainer(container, false, true)
            setMethodsElementSize(container, methodsElement);
        } else {
            isFullScreen = false;
            container.style.width = oldWidth;
            container.style.height = oldHeight;
            focusAndCenterContainer(container, false, null, oldLeft, oldTop);
        }
    });
    /* End of container elements' functionality - Use force, show grid and close button implemented after creation of the elements */

    /* Outliner elements */
    // Div for the show/hide graph button and delete button
    const showHideDeleteDiv = document.createElement('div');
    showHideDeleteDiv.className = 'showHideDeleteDiv';
    // Show container on click
    showHideDeleteDiv.addEventListener('click', function (event) {
        if (event.button === 0) { // Only left mouse button
            focusOnThisContainer(container);
        }
    });

    /* Graph name functionality */
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = displayName;
    nameInput.title = displayName;
    nameInput.autocomplete = 'off';
    nameInput.spellcheck = false;
    // Initially disable input
    nameInput.setAttribute('readonly', true);

    // Enable editing on double-click and apply styling
    nameInput.addEventListener('dblclick', () => {
        nameInput.removeAttribute('readonly');
        nameInput.classList.add('editable'); // Add class
        nameInput.focus();
        availableGraphs = availableGraphs.filter(graph => graph !== displayName); // Remove the graph from the list of available graphs
    });

    // Disable editing on blur and enter key press
    nameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            nameInput.setAttribute('readonly', true);
            nameInput.classList.remove('editable'); // Remove class
            console.log(availableGraphs);

            // If name already exists in the list of names, then swap the names
            if (availableGraphs.includes(nameInput.value)) {
                let counter = 1
                let newName = nameInput.value;
                while (availableGraphs.includes(newName)) {
                    newName = `${nameInput.value}.${String(counter).padStart(3, '0')}`;
                    counter++;
                }
                let currdiv = document.getElementById(nameInput.value);
                currdiv.getElementsByTagName('input')[0].value = newName;
                document.getElementById(`${nameInput.value}span`).textContent = newName;
                availableGraphs.push(newName);
            }
        }
    });
    nameInput.addEventListener('blur', () => {
        nameInput.setAttribute('readonly', true);
        nameInput.classList.remove('editable'); // Remove class
    });

    // Update the graph name on input
    nameInput.addEventListener('input', () => {
        graphNameSpan.textContent = nameInput.value.length > 10 ? nameInput.value.substring(0, 7) + '...' : nameInput.value;
        graphNameSpan.title = nameInput.value;
    });
    showHideDeleteDiv.appendChild(nameInput);
    showHideDeleteDiv.id = nameInput.value
    /* End of graph name functionality */

    /* Outliner graph functionalities */
    // Show/hide graph functionality
    const showHideGraph = document.createElement('button');
    showHideGraph.title = 'Show/hide graph';
    const showHideImg = document.createElement('img');
    showHideImg.src = 'show.png';
    showHideGraph.appendChild(showHideImg);
    showHideGraph.addEventListener('click', function () {
        container.style.display === 'none' ? container.style.display = 'block' : container.style.display = 'none';
        showHideImg.src = container.style.display === 'none' ? 'hide.png' : 'show.png';
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    });
    closeButton.addEventListener('click', () => {
        showHideGraph.click();
    }); // Adding it to the close button as well

    // Focus on graph functionality
    const focusButton = document.createElement('button');
    focusButton.title = 'Focus on this graph';
    const focusImg = document.createElement('img');
    focusImg.src = 'focus.png';
    focusButton.appendChild(focusImg);
    focusButton.addEventListener('click', () => {
        if (container.style.display === 'none') showHideGraph.click();
        focusAndCenterContainer(container);
    });

    /* General graph methods div */
    const graphOptions = document.createElement('div');
    graphOptions.className = 'graphOptions';
    graphOptions.style.display = 'none';

    const duplicateGraph = document.createElement('button'); // Duplicate graph with weights and directions turned on/off
    duplicateGraph.textContent = 'Duplicate graph';
    duplicateGraph.title = 'Duplicate this graph';

    duplicateGraph.addEventListener('click', () => {
        addGraph(edgesRaw, edgesRaw, `${displayName} copy`);
        graphOptions.style.display = "none";;
    })

    const deleteThisGraph = document.createElement('button'); // Delete this graph
    deleteThisGraph.textContent = 'Delete graph';
    deleteThisGraph.title = 'Delete this graph';
    deleteThisGraph.addEventListener('click', () => {
        container.remove(); // Remove the container from the DOM
        availableGraphs = availableGraphs.filter(graph => graph !== displayName); // Remove the graph from the list of available graphs
        document.getElementById(displayName).remove(); // Remove the graph from the list of available methods
        graphCount--; // Decrease the graph count
        graphOptions.style.display = "none";
    });

    graphOptions.appendChild(duplicateGraph);
    graphOptions.appendChild(deleteThisGraph);
    outliner.appendChild(graphOptions);
    /* End of general graph methods div */

    /* Modify graph functionality */
    const graphmodifierButton = document.createElement('button');
    graphmodifierButton.innerHTML = '<b>...</b>';
    graphmodifierButton.title = 'Modify graph';
    graphmodifierButton.addEventListener('click', () => {
        graphOptions.style.display = graphOptions.style.display === 'none' ? 'block' : 'none';
        graphOptions.style.left = `${graphmodifierButton.offsetLeft - 100}px`;
        graphOptions.style.top = `${graphmodifierButton.offsetTop + graphmodifierButton.offsetHeight}px`;
    });

    graphmodifierButton.addEventListener('mouseleave', (event) => {
        if (!graphOptions.contains(event.relatedTarget)) {
            graphOptions.style.display = 'none';
        }
    });

    graphOptions.addEventListener('mouseleave', (event) => {
        if (!graphmodifierButton.contains(event.relatedTarget)) {
            graphOptions.style.display = 'none';
        }
    });
    /* End of modify graph functionality */
    /* End of outliner graph functionalities */

    // Span for the buttons
    const showHideSpanButtons = document.createElement('span');
    showHideSpanButtons.appendChild(focusButton);
    showHideSpanButtons.appendChild(showHideGraph);
    showHideSpanButtons.appendChild(graphmodifierButton);
    showHideDeleteDiv.appendChild(showHideSpanButtons);

    // Div that contains operations of the outliner
    const outMethods = document.createElement('div');
    outMethods.className = 'outMethods';
    outMethods.style.padding = '50px';
    /* End of outliner elements */

    outliner.appendChild(showHideDeleteDiv);

    // Clear previous graph
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    const grid = svg.append('g') // Append a group element to the SVG for the grid

    /* SVG general functionalities */
    /* Zoom functionality and mousewheel binding */
    // Zoom functionality
    function zoom(zoomFactor) {
        let viewBox = svg.attr('viewBox').split(' ').map(Number);
        let [minX, minY, viewWidth, viewHeight] = viewBox;

        const newWidth = viewWidth * zoomFactor;
        const newHeight = viewHeight * zoomFactor;
        const offsetX = (viewWidth - newWidth) / 2;
        const offsetY = (viewHeight - newHeight) / 2;

        svg.attr('viewBox', `${minX + offsetX} ${minY + offsetY} ${newWidth} ${newHeight}`);
        drawGrid(svg, grid); // Update grid size dynamically
    }

    function zoomIn() {
        zoom(0.9); // 10% zoom-in
    }

    function zoomOut() {
        zoom(1.1); // 10% zoom-out
    }

    // Attach zoom to mousewheel
    container.addEventListener('wheel', event => {
        event.preventDefault();
        event.deltaY < 0 ? zoomIn() : zoomOut();
    });
    /* End of zoom functionality */

    /* Pan functionality to middle mouse hold and drag */
    let isPanning = false;
    let startX, startY;

    svg.on('mousedown', (event) => {
        if (event.button !== 1) return; // Middle mouse button
        isPanning = true;
        startX = event.clientX;
        startY = event.clientY;
        document.body.style.cursor = 'grabbing';
    });

    svg.on('mousemove', (event) => {
        if (!isPanning) return;

        let viewBox = svg.attr('viewBox').split(' ').map(Number);
        let [minX, minY, viewWidth, viewHeight] = viewBox;

        let dx = (startX - event.clientX) * (viewWidth / 600); // Scale movement
        let dy = (startY - event.clientY) * (viewHeight / 400);

        svg.attr('viewBox', `${minX + dx} ${minY + dy} ${viewWidth} ${viewHeight}`);
        startX = event.clientX;
        startY = event.clientY;
        drawGrid(svg, grid); // Update grid position
    });

    svg.on('mouseup', () => {
        isPanning = false;
        document.body.style.cursor = 'default';
    });
    /* End of pan functionality */

    svg.on('dblclick', () => adjustViewBox(svg, nodes, grid)); // Bind to double click to adjust viewbox
    /* End of SVG general functionalities */

    // Get the dimensions of the container of the SVG
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Set SVG viewbox - It acts like a camera, and the viewBox attribute defines the position and dimension of the SVG content
    svg.attr('width', width).attr('height', height);
    const SVGwidth = svg.attr('width');
    const SVGheight = svg.attr('height');
    svg.attr('viewBox', `0 0 ${SVGwidth} ${SVGheight}`);

    drawGrid(svg, grid); // Initial grid draw

    // Show/hide grid
    gridCheckbox.addEventListener('change', function () {
        grid.style('display', this.checked ? 'block' : 'none');
    });

    /* Graph elements creation */
    // Mark bidirectional Edges
    const edgeMap = new Set(edges.map(e => `${e.source}-${e.target}`));
    edges.forEach(edge => {
        if (edgeMap.has(`${edge.target}-${edge.source}`)) {
            edge.bidirectional = true;
        }
    });

    // Create nodes from edges
    const nodes = Array.from(
        new Set(edges.flatMap(edge => [edge.source, edge.target]))
    ).map(id => ({ id }));
    /* End of graph elements creation */

    /* Force simulation values */
    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(300))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

    /* End of Force simulation values */

    // Control simulation forces with the use force checkbox
    useForceCheckbox.addEventListener('change', function (event) {
        if (event.target.checked) {
            enableForceSimulation(simulation, edges, width, height);
        } else {
            disableForceSimulation(simulation);
        }
    });

    /* Drawing the graph */
    // Draw links
    const link = svg.selectAll('.link')
        .data(edges)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('source-id', d => `${arrowId}${d.source.id}`)
        .attr('target-id', d => `${arrowId}${d.target.id}`)
        .attr('fill', 'none')
        .attr('stroke', edgeColor)
        .attr('stroke-width', 1.5)
        .on('mouseover', function () {
            d3.select(this).attr('stroke', edgeColorHover);
            // Also change color of the directed marker (arrowhead) if present
            if (directed) {
                const markerUrl = d3.select(this).attr('marker-end');
                if (markerUrl) {
                    // Extract marker id from url(#markerId)
                    const markerIdMatch = markerUrl.match(/url\(#([^)]+)\)/);
                    if (markerIdMatch) {
                        const markerId = markerIdMatch[1];
                        // Change the fill color of the marker's path
                        d3.select(svgElement)
                            .select(`#${markerId}`)
                            .select('path')
                            .attr('fill', edgeColorHover);
                    }
                }
            }
        })
        .on('mouseout', function () {
            d3.select(this).attr('stroke', edgeColor);
            // Also reset color of the directed marker (arrowhead) if present
            if (directed) {
                const markerUrl = d3.select(this).attr('marker-end');
                if (markerUrl) {
                    // Extract marker id from url(#markerId)
                    const markerIdMatch = markerUrl.match(/url\(#([^)]+)\)/);
                    if (markerIdMatch) {
                        const markerId = markerIdMatch[1];
                        // Reset the fill color of the marker's path
                        d3.select(svgElement)
                            .select(`#${markerId}`)
                            .select('path')
                            .attr('fill', edgeColor);
                    }
                }
            }
        })
        .on('contextmenu', function (event, d) {
            event.preventDefault();
            event.stopPropagation();

            // Create context menu
            const menu = document.createElement('div');
            menu.className = 'methodsDiv';
            menu.style.position = 'fixed';
            menu.style.left = `${event.clientX}px`;
            menu.style.top = `${event.clientY}px`;
            menu.style.zIndex = 10000;

            // Delete link option
            // Delete edge button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete this edge';
            deleteBtn.onclick = () => {
                // Remove the edge from the edges array
                const idx = edges.indexOf(d);
                if (idx !== -1) {
                    edges.splice(idx, 1);
                    edgesRaw.splice(idx, 1);
                }
                // Remove from raw edges as well if needed
                const rawIdx = edgesRaw.indexOf(d);
                if (rawIdx !== -1) {
                    edgesRaw.splice(rawIdx, 1);
                }
                // Remove the link visually
                d3.select(this).remove();
                // Remove edge label if present
                if (edgeLabel) {
                    edgeLabel.filter(e => e === d).remove();
                }
                d3.select(svgElement)
                    .selectAll('.link2')
                    .filter(e => e === d)
                    .remove();
                // Remove context menu
                menu.remove();
            };
            menu.appendChild(deleteBtn);

            // Change edge weight button
            const changeWeightBtn = document.createElement('button');
            changeWeightBtn.textContent = 'Change edge weight';
            changeWeightBtn.onclick = () => {
                let newWeight = parseFloat(prompt('Enter new weight for this edge:', d.weight));
                if (newWeight !== null) {
                    if (typeof newWeight !== 'number' || isNaN(newWeight)) {
                        menu.remove();
                        alert('Weight must be a valid number.');
                        return;
                    }
                    d.weight = newWeight;
                    // Update edgeLabel if present
                    if (edgeLabel) {
                        edgeLabel
                            .filter(e => e === d)
                            .text(newWeight);
                    }
                    // Also update in edgesRaw if possible
                    const raw = edgesRaw.find(e =>
                        e.source === (d.source.id || d.source) &&
                        e.target === (d.target.id || d.target)
                    );
                    if (raw) raw.weight = newWeight;
                }
                menu.remove();
            };
            menu.appendChild(changeWeightBtn);

            // Remove menu on click elsewhere
            function removeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('mousedown', removeMenu);
                }
            }
            document.addEventListener('mousedown', removeMenu, { once: true });

            document.body.appendChild(menu);
        })

    // Buffer size for edge hover
    const link2 = svg.selectAll('.link2')
        .data(edges)
        .enter()
        .append('path')
        .attr('class', 'link2')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 20)
        .style('pointer-events', 'stroke')  // Make only the stroke area interactive
        .lower()
        .on('mouseover', function (event, d) {
            // Forward hover to corresponding `.link`
            const selector = `.link[source-id='${arrowId}${d.source.id}'][target-id='${arrowId}${d.target.id}']`;
            d3.select(selector).dispatch('mouseover');
        })
        .on('mouseout', function (event, d) {
            const selector = `.link[source-id='${arrowId}${d.source.id}'][target-id='${arrowId}${d.target.id}']`;
            d3.select(selector).dispatch('mouseout');
        })
        .on('contextmenu', function (event, d) {
            const selector = `.link[source-id='${arrowId}${d.source.id}'][target-id='${arrowId}${d.target.id}']`;
            d3.select(selector).node().dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: false,
                cancelable: true,
                clientX: event.clientX,
                clientY: event.clientY,
                view: window
            }));
        });

    // Draw nodes - Drawing nodes after links so that they appear in front
    const node = svg.selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('fill', nodeColor)
        .on('mouseover', function () {
            d3.select(this).attr('fill', hoverColor);
        })
        .on('mouseout', function () {
            d3.select(this).attr('fill', nodeColor);
        })
        .call(
            d3.drag()
                .on('start', function (event, d) { dragStarted(event, d, simulation, this); })
                .on('drag', function (event, d) { dragged(event, d, this); })
                .on('end', function (event, d) { dragEnded(event, d, simulation, useForceCheckbox.checked, this); })
        )
        .on('contextmenu', function (event, d) {
            event.preventDefault();
            event.stopPropagation();

            // Create context menu
            const menu = document.createElement('div');
            menu.className = 'methodsDiv';
            menu.style.position = 'fixed';
            menu.style.left = `${event.clientX}px`;
            menu.style.top = `${event.clientY}px`;
            menu.style.zIndex = 10000;

            // Delete node option
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete this vertex';
            deleteBtn.onclick = () => {
                // Remove the node from the nodes array
                const idx = nodes.indexOf(d);
                if (idx !== -1) {
                    nodes.splice(idx, 1);
                    edges = edges.filter(edge => edge.source !== d && edge.target !== d); // Remove edges connected to this node
                    edgesRaw = edgesRaw.filter(edge => edge.source !== d && edge.target !== d); // Remove from raw edges as well
                }
                // Remove the node visually
                d3.select(this).remove();
                // Remove labels associated with this node
                label.filter(l => l === d).remove();
                if (edgeLabel) {
                    edgeLabel.filter(e => e.source === d || e.target === d).remove();
                }
                // Remove edges that go to and from this node
                link.filter(l => l.source === d || l.target === d).remove();
                // Update edges and edgesRaw
                edges = edges.filter(edge => edge.source.id !== d.id && edge.target.id !== d.id);
                edgesRaw = edgesRaw.filter(edge => edge.source !== d.id && edge.target !== d.id);
                // Remove context menu
                menu.remove();
            };
            menu.appendChild(deleteBtn);

            // Remove menu on click elsewhere
            function removeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('mousedown', removeMenu);
                }
            }
            document.addEventListener('mousedown', removeMenu, { once: true });

            document.body.appendChild(menu);
        });

    // Add labels for nodes
    const label = svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('dy', 3)
        .attr('text-anchor', 'middle')
        .text(d => d.id)
        .attr('font-size', 16)
        .attr('fill', nodeLabelColor)
        .style('pointer-events', 'none')
        .style('font-weight', 'bold');

    // Add labels for edges (weights) if weighted
    let edgeLabel;
    if (weighted) {
        edgeLabel = svg.selectAll('.edge-label')
            .data(edges)
            .enter()
            .append('text')
            .attr('class', 'edge-label')
            .attr('font-size', 18)
            .attr('fill', edgeWeightColor)
            .text(d => d.weight)
            .style('pointer-events', 'none')
    }
    /* End of graph drawing */

    /* Functions to update positions */
    positionNodesInCircle(nodes, simulation, width, height); // Initial call to generate the graph
    // Apply positions to nodes
    node.attr('cx', d => d.x).attr('cy', d => d.y);
    adjustViewBox(svg, nodes, grid); // Initial call to center the graph

    // Update positions on simulation
    simulation.on('tick', () => {
        setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
        setEdgePositions(link2, edgeLabel, node, label, directed, weighted, svg, arrowId);
    });

    /* Auto-rearrange nodes functionality */
    rearrangeNodes.addEventListener('click', () => {
        positionNodesInCircle(nodes, simulation, width, height);
        // Apply positions to nodes
        node.attr('cx', d => d.x).attr('cy', d => d.y);

        // Update link positions
        setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
        setEdgePositions(link2, edgeLabel, node, label, directed, weighted, svg, arrowId);
        adjustViewBox(svg, nodes, grid);
        drawGrid(svg, grid);

        // positionNodesInCircle sets the simulation forces to null, enabling it based on use force checkbox
        simulation.alphaDecay(1);
        simulation.alphaTarget(0);
        if (useForceCheckbox.checked) {
            enableForceSimulation(simulation, edges, width, height);
        };
    });
    /* End of auto-rearrange nodes functionality */
    /* End of functions to update positions */
};
