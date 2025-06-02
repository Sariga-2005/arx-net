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

function dijkstra(edges, start = prompt("Enter start vertex"), nodes, isDirected = true) {
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
            graph[target].push({ target: source, weight });

        }
    }

    for (const node of nodes) {
        if (!graph[node.id]) {
            graph[node.id] = [];
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

function floydWarshall(edges, directed) {
    const graph = {};
    const nodes = new Set();

    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = {};
        if (!graph[target]) graph[target] = {};
        graph[source][target] = weight;
        if (!directed) graph[target][source] = weight; // For undirected graphs
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

function bellmanFord(edges, start = prompt("Enter start vertex"), nodes, isDirected) {
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
            graph[target].push({ target: source, weight });

        }
    }

    for (const node of nodes) {
        if (!graph[node.id]) {
            graph[node.id] = [];
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
    for (const { source, target, weight } of edges) {
        if (distances[source] + weight < distances[target]) {
            alert("Graph contains a negative weight cycle.");
            return null;
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

function mst(edges, weighted, graphName) {
    const graph = {};
    if (!weighted) {
        alert("Minimum Spanning Tree requires weighted edges, assuming all weights are 1.");
    }
    for (const { source, target, weight } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = [];
        graph[source].push({ target, weight: weight || 1 });
        graph[target].push({ target: source, weight: weight || 1 }); // undirected
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

    const visited = new Set();
    const pq = new PriorityQueue();
    const mstEdges = [];

    const startNode = Object.keys(graph)[0];
    if (!startNode) {
        console.log("Graph is empty.");
        return;
    }

    visited.add(startNode);
    for (const neighbor of graph[startNode]) {
        pq.enqueue({ from: startNode, to: neighbor.target }, neighbor.weight);
    }

    while (!pq.isEmpty()) {
        const { element, priority: weight } = pq.dequeue();
        const { from, to } = element;

        if (visited.has(to)) continue;
        visited.add(to);
        mstEdges.push({ source: from, target: to, weight });

        const neighbors = graph[to];
        if (Array.isArray(neighbors)) {
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.target)) {
                    pq.enqueue({ from: to, to: neighbor.target }, neighbor.weight);
                }
            }
        }
    }

    let mstResult = '';
    console.log("Minimum Spanning Tree:");
    for (const edge of mstEdges) {
        mstResult += `(${edge.source}_${edge.target}_${edge.weight}),`
    }
    mstResult = mstResult.slice(0, -1); // Remove trailing comma

    addGraph(mstResult, null, `${graphName} MST`, false, false);
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

    let sccResult = '';
    for (const component of sccs) {
        sccResult += `{${component.join(',')}}, `;
    }
    sccResult = sccResult.slice(0, -2); // Remove trailing comma and space
    return sccResult;
}

function BiconnectedComponents(edges) {
    const graph = {};
    for (const { source, target } of edges) {
        if (!graph[source]) graph[source] = [];
        if (!graph[target]) graph[target] = [];
        graph[source].push(target);
        graph[target].push(source); // undirected
    }

    let time = 0;
    const disc = {}, low = {}, parent = {};
    const stack = [];
    const bcc = [];

    function dfs(u) {
        disc[u] = low[u] = ++time;
        let children = 0;

        for (const v of graph[u]) {
            if (!disc[v]) {
                parent[v] = u;
                stack.push([u, v]);
                children++;

                dfs(v);

                low[u] = Math.min(low[u], low[v]);

                if ((disc[u] === 1 && children > 1) || (disc[u] > 1 && low[v] >= disc[u])) {
                    const component = [];
                    let edge;
                    do {
                        edge = stack.pop();
                        component.push(edge);
                    } while (edge[0] !== u || edge[1] !== v);
                    bcc.push(component);
                }
            } else if (v !== parent[u] && disc[v] < disc[u]) {
                low[u] = Math.min(low[u], disc[v]);
                stack.push([u, v]);
            }
        }
    }

    for (const node in graph) {
        if (!disc[node]) {
            dfs(node);
            if (stack.length > 0) {
                bcc.push(stack.splice(0));
            }
        }
    }

    let bccResult = '';
    for (let i = 0; i < bcc.length; i++) {
        bccResult += `{`;
        for (let j = 0; j < bcc[i].length; j++) {
            bccResult += `(${bcc[i][j]}), `;
        }
        bccResult = bccResult.slice(0, -2); 
        bccResult += '}, ';
    }
    bccResult = bccResult.slice(0, -2);
    return bccResult;
}
