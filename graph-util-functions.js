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
        if (directed) {
            if (algorithm.name === 'mst') {
                // MST is not applicable for directed graphs
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

function handleAlgorithmClick(algorithm, edgesRaw, nodes, directed, weighted, displayName, methodsElement) {
    const resultContainer = document.createElement('p');
    let result = null;
    let label = '';

    const getSource = (promptText) => {
        const input = prompt(promptText);
        return input ? input.toUpperCase() : null;
    };

    switch (algorithm.name) {
        case 'bfs': {
            const source = getSource("Enter source vertex");
            if (!source) break;
            result = bfs(edgesRaw, source, directed);
            label = `BFS with ${source} as source node: `;
            break;
        }
        case 'dfs': {
            const source = getSource("Enter source vertex");
            result = dfs(edgesRaw, source || undefined, directed);
            label = `DFS through ${displayName}${source ? ` with ${source} as source node` : ''}: `;
            break;
        }
        case 'dijkstra': {
            const source = getSource("Enter source vertex");
            if (!source) break;
            result = dijkstra(edgesRaw, source, nodes, directed);
            label = `Dijkstra's through ${displayName} with ${source} as source node: <br> <br>`;
            break;
        }
        case 'floydWarshall':
            result = floydWarshall(edgesRaw, nodes, directed);
            label = `Floyd Warshall through ${displayName}: `;
            break;

        case 'bellmanFord': {
            const source = getSource("Enter source vertex");
            if (!source) break;
            result = bellmanFord(edgesRaw, source, nodes, directed);
            label = `Bellman Ford through ${displayName} with ${source} as source node: <br> <br>`;
            break;
        }
        case 'mst':
            mst(edgesRaw, weighted, displayName);
            result = ''; // MST function handles its own output
            label = `Generated MST through ${displayName}: `;
            break;

        case 'topologicalSort':
            result = topologicalSort(edgesRaw);
            label = `Topological Sort through ${displayName}: `;
            break;

        case 'scc':
            result = StronglyConnectedComponents(edgesRaw);
            label = `SCC through ${displayName}: `;
            break;

        case 'bcc':
            result = BiconnectedComponents(edgesRaw);
            label = `BCC through ${displayName}: `;
            break;

        default:
            alert("Algorithm not implemented.");
            return;
    }

    if (result !== null) {
        resultContainer.innerHTML = `<span style="color: #ffc66d;">${label}</span> ${result} <br>`;
        methodsElement.appendChild(resultContainer);
        methodsElement.style.display = 'block';
        methodsElement.scrollTop = methodsElement.scrollHeight;
    } else {
        resultContainer.remove();
    }
}

// Snapping functionality for 4 and 9 graph views
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

// Parse edges input into an array of edge objects
function parseEdges(edgesInput, directed = true) {
    let edgesRaw = edgesInput.split(',').map(edge => {
        edge = edge.trim();

        // Validate the edge format
        const simpleFormat = /^([a-zA-Z0-9]{2})(\d*)$/; // Matches 'ab5'
        const parenFormat = /^\(([a-zA-Z0-9]+)_([a-zA-Z0-9]+)(?:_(\d+))?\)$/; // Matches '(a_b_5)' and '(a_b)'

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
        } else if (edge.length === 1) {
            source = edge;
            target = null;
            weight = null;
        } else {
            alert("Invalid edge format: " + edge);
            return null;
        }

        if (isNaN(weight)) {
            weight = 1;
        }

        return { source, target, weight };
    }).filter(edge => edge !== null);

    // Remove duplicate edges, keeping only the last occurrence. Can be removed for multigraph functionality
    const edgeMap = new Map();
    for (const edge of edgesRaw) {
        if (edge.source && edge.target) {
            const key = `${edge.source}_${edge.target}`;
            edgeMap.set(key, edge); // Overwrites previous, so last stays
            // If not directed, also remove the reverse edge
            if (!directed) {
                const reverseKey = `${edge.target}_${edge.source}`;
                if (edgeMap.has(reverseKey)) {
                    edgeMap.delete(reverseKey);
                }
            }
        }
    }
    edgesRaw = Array.from(edgeMap.values());
    // Disabling multigraph functionality for now. Comment out the above lines to enable it.

    return edgesRaw;
}

// Inverse of parseEdges function
function stringifyEdges(edgesRaw) {
    return edgesRaw
        .map(edge => `(${edge.source}_${edge.target}_${edge.weight})`)
        .join(', ');
}

function indexToLabel(index) {
    let label = '';
    while (index >= 0) {
        label = String.fromCharCode(97 + (index % 26)) + label;
        index = Math.floor(index / 26) - 1;
    }
    return label;
}

// This function currently supports generating multigraphs as well, but that functionality has been disabled
function generateRandomGraph(vertexCount, edgeCount, options = {}) {
    const {
        allowDuplicates = duplicateEdges.checked,
        ensureConnected = connected.checked,
        allowSelfLoops = selfLoops.checked,
        minWeightValue = parseInt(minWeight.value),
        maxWeightValue = parseInt(maxWeight.value),
        isDirectedValue = isDirected.checked
    } = options;

    if (vertexCount <= 0) {
        alert("Vertex count must be greater than 0.");
        graphInputField.value = "";
        return;
    }

    let maxEdgesWithoutDuplicates = 0;
    if (allowSelfLoops) {
        if (isDirectedValue) {
            maxEdgesWithoutDuplicates = vertexCount * vertexCount; // Directed with self-loops
        } else {
            maxEdgesWithoutDuplicates = vertexCount * (vertexCount - 1) / 2 + vertexCount; // Undirected with self-loops
        }
    } else {
        if (isDirectedValue) {
            maxEdgesWithoutDuplicates = vertexCount * (vertexCount - 1); // Directed without self-loops
        } else {
            maxEdgesWithoutDuplicates = vertexCount * (vertexCount - 1) / 2; // Undirected without self-loops
        }
    }

    const minEdgesToConnect = vertexCount - 1;

    // Adjust edge count
    if (edgeCount < minEdgesToConnect) {
        if (ensureConnected) {
            alert(`To ensure connectivity, at least ${minEdgesToConnect} edges are needed. Using minimum required.`);
            edgeCount = minEdgesToConnect;
        }
    }

    if (!allowDuplicates && edgeCount > maxEdgesWithoutDuplicates) {
        alert(`Too many edges for a simple graph (no duplicates${allowSelfLoops ? '' : ', no self-loops'}). Using max allowed.`);
        edgeCount = maxEdgesWithoutDuplicates;
    }

    const vertices = Array.from({ length: vertexCount }, (_, i) => indexToLabel(i));
    const edges = new Set();
    const edgeList = [];

    const usedVertices = new Set();

    // Step 1: Build spanning tree if needed
    if (ensureConnected && vertexCount > 1) {
        const shuffled = [...vertices];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        for (let i = 1; i < shuffled.length; i++) {
            const u = shuffled[i - 1];
            const v = shuffled[i];
            const weight = Math.floor(Math.random() * (maxWeightValue - minWeightValue + 1)) + minWeightValue;
            const key = `${u}_${v}`;
            edges.add(key);
            edgeList.push({ source: u, target: v, weight });
            usedVertices.add(u);
            usedVertices.add(v);
        }
    }

    // Step 2: Add additional edges, but with a loop cap
    let attempts = 0;
    const maxAttempts = edgeCount * 10;

    while (edgeList.length < edgeCount && attempts < maxAttempts) {
        attempts++;

        const u = vertices[Math.floor(Math.random() * vertexCount)];
        const v = vertices[Math.floor(Math.random() * vertexCount)];
        if (!allowSelfLoops && u === v) continue;

        const key = `${u}_${v}`;
        const reverseKey = `${v}_${u}`;

        if (!allowDuplicates) {
            if (isDirectedValue) {
                if (edges.has(key)) continue;
            } else {
                if (edges.has(key) || edges.has(reverseKey)) continue;
            }
            edges.add(key);
        }


        const weight = Math.floor(Math.random() * (maxWeightValue - minWeightValue + 1)) + minWeightValue;

        if (!allowDuplicates) edges.add(key);
        edgeList.push({ source: u, target: v, weight });
        usedVertices.add(u);
        usedVertices.add(v);
    }

    graphInputField.value = stringifyEdges(edgeList);
    graphInputVertices.value = vertices.join(', ');
    addGraph();
}

generateRandomButton.addEventListener('click', () => {
    const vertexCount = vertexInput.value;
    const edgeCount = edgeInput.value;
    generateRandomGraph(vertexCount, edgeCount);
});

function handleGraphNameInput(event, nameInput) {
    if (event.key !== 'Enter') return;

    nameInput.setAttribute('readonly', true);
    nameInput.classList.remove('editable');

    const originalName = nameInput.value;

    if (availableGraphs.includes(originalName)) {
        let counter = 1;
        let newName = originalName;

        while (availableGraphs.includes(newName)) {
            newName = `${originalName}.${String(counter).padStart(3, '0')}`;
            counter++;
        }

        const graphDiv = document.getElementById(originalName);
        if (graphDiv) {
            const input = graphDiv.querySelector('input');
            const labelSpan = document.getElementById(`${originalName}span`);

            if (input) input.value = newName;
            if (labelSpan) labelSpan.textContent = newName;

            availableGraphs.push(newName);
        }
    } else {
        availableGraphs.push(originalName);
    }
}

// Supporting function that will be used to rotate arrows based on edge direction
function smoothFunction(x, k = 0.02, c = 275) {
    const exponent = -k * (x - c);
    const denominator = 1 + Math.exp(exponent);
    const result = 10 - (2.4 / denominator);
    return result;
}

function enableGraphNameEditing(nameInput, displayName) {
    nameInput.removeAttribute('readonly');
    nameInput.classList.add('editable');
    nameInput.focus();

    // Remove the graph name from the global list
    availableGraphs = availableGraphs.filter(graph => graph !== displayName);
}

function deleteGraph(container, displayName) {
    // Remove the container from the DOM
    container.remove();

    // Remove from global list of graph names
    availableGraphs = availableGraphs.filter(graph => graph !== displayName);

    // Remove from the methods list UI
    const methodsEntry = document.getElementById(displayName);
    if (methodsEntry) methodsEntry.remove();

    // Decrement graph count and hide graph options
    graphCount--;
    graphOptions.style.display = "none";
}
