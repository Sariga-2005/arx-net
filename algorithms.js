function vertexExists(edges, vertex, isDirected = true) {
    for (const { source, target } of edges) {
        if (source === vertex || target === vertex) return true;
        if (!isDirected && (target === vertex || source === vertex)) return true;
    }
    return false;
}

function bfs(edges, start = prompt("Enter start vertex"), isDirected = true) {
    if (!vertexExists(edges, start, isDirected)) {
        alert("Vertex " + start + " not found.");
        return null;
    }

    const graph = {};
    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        graph[source].push(target);

        // For undirected graphs, also include reverse:
        if (!isDirected) {
            if (!graph[target]) graph[target] = [];
            graph[target].push(source);
        }
    }

    const visited = new Set();
    const queue = [start];
    const result = [];

    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            result.push(node);
            const neighbors = graph[node] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
        }
    }

    return result;
}

function dfs(edges, start = prompt("Enter start vertex"), isDirected = true) {
    if (!vertexExists(edges, start, isDirected)) {
        alert("Vertex " + start + " not found.");
        return null;
    }

    const graph = {};
    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        graph[source].push(target);
        // For undirected graphs, also include reverse:

        if (!isDirected) {
            if (!graph[target]) graph[target] = [];
            graph[target].push(source);
        }
    }

    const visited = new Set();
    const result = [];

    function visit(node) {
        if (visited.has(node)) return;
        visited.add(node);
        result.push(node);
        const neighbors = graph[node] || [];
        for (const neighbor of neighbors) {
            visit(neighbor);
        }
    }

    visit(start);
    return result;
}
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        this.items.push({ element, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

function dijkstra(edges, start = prompt("Enter start vertex"), isDirected = true) {
    if (!vertexExists(edges, start, isDirected)) {
        alert("Vertex " + start + " not found.");
        return null;
    }

    const graph = {};
    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = [];
        graph[source].push({ target, weight });
        // For undirected graphs, also include reverse:
        if (!isDirected) {
            if (!graph[target]) graph[target] = [];
            graph[target].push(source);
        }
    }

    const distances = {};
    const previous = {};
    const queue = new PriorityQueue();

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    queue.enqueue(start, 0);

    while (!queue.isEmpty()) {
        const { element: currentNode } = queue.dequeue();
        const neighbors = graph[currentNode] || [];

        for (const { target, weight } of neighbors) {
            const alt = distances[currentNode] + weight;
            if (alt < distances[target]) {
                distances[target] = alt;
                previous[target] = currentNode;
                queue.enqueue(target, alt);
            }
        }
    }

    return `
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Vertex</th><th>Distance</th><th>Path</th></tr>
        ${Object.keys(distances).map(vertex => {
        let path = [];
        let current = vertex;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        return `
                <tr>
                    <td>${vertex}</td>
                    <td>${distances[vertex] === Infinity ? "∞" : distances[vertex]}</td>
                    <td>${distances[vertex] === Infinity ? "unreachable" : path.join(" → ")}</td>
                </tr>
            `;
    }).join("")}
    </table>
`;

}

function floydWarshall(edges) {
    const graph = {};
    const nodes = new Set();

    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = {};
        if (!graph[target]) graph[target] = {};
        graph[source][target] = weight;
        graph[target][source] = weight; // For undirected graphs
        nodes.add(source);
        nodes.add(target);
    }

    const dist = {};
    const next = {};

    for (const node of nodes) {
        dist[node] = {};
        next[node] = {};
        for (const otherNode of nodes) {
            if (node === otherNode) {
                dist[node][otherNode] = 0;
            } else if (graph[node][otherNode]) {
                dist[node][otherNode] = graph[node][otherNode];
            } else {
                dist[node][otherNode] = Infinity;
            }
            next[node][otherNode] = otherNode;
        }
    }

    for (const k of nodes) {
        for (const i of nodes) {
            for (const j of nodes) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    return `
    ${Array.from(nodes).map(i => `
        <h4>From: ${i}</h4>
        <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>To</th><th>Distance</th><th>Path</th></tr>
            ${Array.from(nodes).map(j => {
        if (i === j) return '';
        const distance = dist[i][j] === Infinity ? "∞" : dist[i][j];
        let path = [];
        let u = i;
        if (next[i][j] === undefined) {
            return `
                        <tr>
                            <td>${j}</td>
                            <td>∞</td>
                            <td>unreachable</td>
                        </tr>`;
        }
        while (u !== j) {
            path.push(u);
            u = next[u][j];
            if (u === undefined) break;
        }
        path.push(j);
        return `
                    <tr>
                        <td>${j}</td>
                        <td>${distance}</td>
                        <td>${distance === "∞" ? "unreachable" : path.join(" → ")}</td>
                    </tr>`;
    }).join('')}
        </table>
    `).join('')}
`;
}

function bellmanFord(edges, start = prompt("Enter start vertex"), isDirected) {
    if (!vertexExists(edges, start, isDirected)) {
        alert("Vertex " + start + " not found.");
        return null;
    }
    const graph = {};
    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = [];
        graph[source].push({ target, weight });
        // For undirected graphs, also include reverse:
        if (!isDirected) {
            if (!graph[target]) graph[target] = [];
            graph[target].push(source);
        }
    }

    const distances = {};
    const previous = {};

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    for (let i = 0; i < Object.keys(graph).length - 1; i++) {
        for (const { source, target, weight } of edges) {
            if (distances[source] + weight < distances[target]) {
                distances[target] = distances[source] + weight;
                previous[target] = source;
            }
        }
    }

    return `
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><th>Vertex</th><th>Distance</th><th>Path</th></tr>
        ${Object.keys(distances).map(vertex => {
        let path = [];
        let current = vertex;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }
        return `
                <tr>
                    <td>${vertex}</td>
                    <td>${distances[vertex] === Infinity ? "∞" : distances[vertex]}</td>
                    <td>${distances[vertex] === Infinity ? "unreachable" : path.join(" → ")}</td>
                </tr>
            `;
    }).join("")}
    </table>
`;
}

function mst(edges) {
    const graph = {};
    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = []; // Needed for undirected graphs
        graph[source].push({ target, weight });
        graph[target].push({ target: source, weight }); // Add reverse for undirected
    }

    const mstEdges = [];
    const visited = new Set();
    const queue = new PriorityQueue();

    const startNode = Object.keys(graph)[0];
    visited.add(startNode);

    for (const { target, weight } of graph[startNode]) {
        queue.enqueue({ source: startNode, target, weight }, weight);
    }

    while (!queue.isEmpty()) {
        const { element: { source, target, weight } } = queue.dequeue();
        if (!visited.has(target)) {
            visited.add(target);
            mstEdges.push({ source, target, weight });

            for (const { target: neighborTarget, weight: neighborWeight } of graph[target]) {
                if (!visited.has(neighborTarget)) {
                    queue.enqueue({ source: target, target: neighborTarget, weight: neighborWeight }, neighborWeight);
                }
            }
        }
    }

    return mstEdges;
}

function topologicalSort(edges) {
    const graph = {};
    const inDegree = {};

    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = [];
        graph[source].push(target);
        inDegree[target] = (inDegree[target] || 0) + 1;
        inDegree[source] = inDegree[source] || 0;
    }

    const queue = [];
    for (const node in inDegree) {
        if (inDegree[node] === 0) {
            queue.push(node);
        }
    }

    const sorted = [];
    while (queue.length > 0) {
        const node = queue.shift();
        sorted.push(node);

        for (const neighbor of graph[node]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    if (sorted.length !== Object.keys(inDegree).length) {
        alert("Graph has at least one cycle.");
        return null;
    }
    return sorted;
}

function StronglyConnectedComponents(edges) {
    const graph = {};
    const reverseGraph = {};
    const visited = new Set();
    const stack = [];

    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!reverseGraph[target]) reverseGraph[target] = [];
        graph[source].push(target);
        reverseGraph[target].push(source);
    }

    function dfs(node) {
        visited.add(node);
        for (const neighbor of graph[node] || []) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
        stack.push(node);
    }
    for (const node in graph) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }
    visited.clear();
    const sccs = [];
    function reverseDfs(node, component) {
        visited.add(node);
        component.push(node);
        for (const neighbor of reverseGraph[node] || []) {
            if (!visited.has(neighbor)) {
                reverseDfs(neighbor, component);
            }
        }
    }
    while (stack.length > 0) {
        const node = stack.pop();
        if (!visited.has(node)) {
            const component = [];
            reverseDfs(node, component);
            sccs.push(component);
        }
    }
    return sccs;
}

function BiconnectedComponents(edges) {
    const graph = {};
    const visited = new Set();
    const low = {};
    const disc = {};
    const parent = {};
    const bccs = [];
    let time = 0;

    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = [];
        graph[source].push(target);
        graph[target].push(source);
    }

    function bccDFS(node) {
        visited.add(node);
        disc[node] = low[node] = ++time;
        let children = 0;

        for (const neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                children++;
                parent[neighbor] = node;
                bccDFS(neighbor);

                low[node] = Math.min(low[node], low[neighbor]);

                if ((parent[node] === undefined && children > 1) || (parent[node] !== undefined && low[neighbor] >= disc[node])) {
                    const bcc = [];
                    while (bcc.length === 0 || bcc[bcc.length - 1] !== node) {
                        bcc.push(bcc.pop());
                    }
                    bccs.push(bcc);
                }
            } else if (neighbor !== parent[node]) {
                low[node] = Math.min(low[node], disc[neighbor]);
            }
        }
    }

    for (const node in graph) {
        if (!visited.has(node)) {
            bccDFS(node);
        }
    }
    return bccs;
}