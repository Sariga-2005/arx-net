/* Function to align edges */
function setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId) {
    link.attr('d', d => {
        // Arc bidirectional edges
        if (d.selfLoop) {
            const x = d.source.x;
            const y = d.source.y;
            const loopRadius = 30; // You can tweak this
            const offsetX = 0; // Offset to make the loop visible
            const offsetY = -25; // No vertical offset for the loop

            // Draw a loop using an elliptical arc command, offset slightly so it's visible
            // Draw a visible self-loop as an elliptical arc
            return `M${x + offsetX},${y + offsetY - loopRadius}
                a${loopRadius},${loopRadius} 0 1,1 0,${2 * loopRadius}
                a${loopRadius},${loopRadius} 0 1,1 0,${-2 * loopRadius}`;

        } else if (d.bidirectional) {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // Arc radius
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        }
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
    });

    if (link.attr('class') === 'link') {
        link.each(function (d) {
            const path = d3.select(this);
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const length = Math.sqrt(dx * dx + dy * dy); // Arc radius

            // Create a unique marker ID for each arrow
            const uniqueArrowId = `${arrowId}-${d.source.id}-${d.target.id}`;

            if (directed) {
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
            }

            // Update the orient attribute of the unique marker
            if (d.selfLoop) {
                const angle = Math.atan2(dy, dx) + Math.PI / (smoothFunction(length));
                // For self-loops, we can set a fixed orientation
                svg.select(`#${uniqueArrowId}`)
                    .attr('orient', 0) // Convert radians to degrees
                    .attr('refX', 4)
                    .attr('refY', -0.5);
            }
            else if (d.bidirectional) {
                // Calculate the tangent angle at the end of the arc - used to rotate directed markers based on the edge curving
                const angle = Math.atan2(dy, dx) + Math.PI / (smoothFunction(length));
                svg.select(`#${uniqueArrowId}`)
                    .attr('orient', angle * (180 / Math.PI)); // Convert radians to degrees
            } else {
                svg.select(`#${uniqueArrowId}`)
                    .attr('orient', 'auto');
            }
        });

        // Add weights if weighted
        if (weighted) {
            edgeLabel
                .attr('x', d => {
                    const midpointX = (d.source.x + d.target.x) / 2;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    if (d.selfLoop === true) {
                        const offsetX = -5;
                        return midpointX + offsetX;
                    }
                    else if (d.bidirectional === true) {
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
                    if (d.selfLoop === true) {
                        const offsetY = -27;
                        return midpointY + offsetY;
                    }
                    else if (d.bidirectional === true) {
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

function handleEdgeMouseOver(pathElement, edgeHoverColor, directed, svgElement) {
    d3.select(pathElement).attr('stroke', edgeHoverColor);

    if (directed) {
        const markerUrl = d3.select(pathElement).attr('marker-end');
        const match = markerUrl?.match(/url\(#([^)]+)\)/);
        if (match) {
            d3.select(svgElement)
                .select(`#${match[1]}`)
                .select('path')
                .attr('fill', edgeHoverColor);
        }
    }
}

function handleEdgeMouseOut(pathElement, edgeColor, directed, svgElement) {
    d3.select(pathElement).attr('stroke', edgeColor);

    if (directed) {
        const markerUrl = d3.select(pathElement).attr('marker-end');
        const match = markerUrl?.match(/url\(#([^)]+)\)/);
        if (match) {
            d3.select(svgElement)
                .select(`#${match[1]}`)
                .select('path')
                .attr('fill', edgeColor);
        }
    }
}

function showEdgeContextMenu(event, d, svg, edgeLabel, edges, edgesRaw, node, label, directed, weighted, arrowId, link, link2) {
    event.preventDefault();
    event.stopPropagation();

    const menu = document.createElement('div');
    menu.className = 'floating-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete this edge';
    deleteBtn.onclick = () => {
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

        svg.selectAll('.link').filter(e => e === d).remove();
        if (edgeLabel) edgeLabel.filter(e => e === d).remove();
        svg.selectAll('.link2').filter(e => e === d).remove();

        if (d.bidirectional) {
            const reverse = edges.find(e =>
                (e.source.id || e.source) === (d.target.id || d.target) &&
                (e.target.id || e.target) === (d.source.id || d.source)
            );
            if (reverse) {
                reverse.bidirectional = false;
                d.bidirectional = false;
            }
        }

        setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
        setEdgePositions(link2, edgeLabel, node, label, directed, weighted, svg, arrowId);

        menu.remove();
    };
    menu.appendChild(deleteBtn);

    const changeWeightBtn = document.createElement('button');
    changeWeightBtn.textContent = 'Change edge weight';
    changeWeightBtn.onclick = () => {
        let newWeight = parseFloat(prompt('Enter new weight for this edge:', d.weight));
        if (newWeight == null || isNaN(newWeight)) {
            alert('Weight must be a valid number.');
        } else {
            d.weight = newWeight;
            if (edgeLabel) edgeLabel.filter(e => e === d).text(newWeight);
            const raw = edgesRaw.find(e =>
                e.source === (d.source.id || d.source) &&
                e.target === (d.target.id || d.target)
            );
            if (raw) raw.weight = newWeight;
        }
        menu.remove();
    };
    menu.appendChild(changeWeightBtn);

    document.addEventListener('mousedown', function removeMenu(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
        }
    }, { once: true });

    document.body.appendChild(menu);
}

function addGraph(edgesInput = null, nodes = null, inputName = null, directed = null, weighted = null) { // Core function will all functionalities
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
    let edgesInputValue = document.getElementById('edges').value;
    edgesInput = edgesInput === null ? edgesInputValue.toUpperCase() : edgesInput; // Use the provided edgesInput or the value from the input field
    directed = directed ?? document.getElementById('directed').checked;
    weighted = weighted ?? document.getElementById('weighted').checked;

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
    const operationPanel = document.createElement('div');
    operationPanel.className = 'operation-panel';

    // Rearrange nodes button
    const rearrangeNodes = document.createElement('button');
    rearrangeNodes.title = 'Rearrange vertices spaced evenly in a circle';
    const rearrangeNodesImg = document.createElement('img');
    rearrangeNodesImg.src = 'images/rearrange.png';
    rearrangeNodes.appendChild(rearrangeNodesImg);
    operationPanel.appendChild(rearrangeNodes);

    // Applicable methods button
    const methodsButton = document.createElement('button');
    methodsButton.title = 'Show available methods';
    methodsButton.innerHTML = '<b>&#8964;</b>';
    operationPanel.appendChild(methodsButton);

    headerSpan.appendChild(operationPanel);

    // Input Validation - Parse edges
    edges = parseEdges(edgesInput, directed);
    edgesRaw = parseEdges(edgesInput, directed);
    if (edges.length === 0) {
        return;
    }
    const applicableAlgorithms = filterAlgorithms(algorithms, directed, weighted);
    // Create new div for available methods button
    /* Available methods */
    const methodsDiv = document.createElement('div');
    methodsDiv.className = 'floating-menu';
    methodsDiv.style.display = 'none';

    // Create buttons for each applicable algorithm
    applicableAlgorithms.forEach(algorithm => {
        const button = document.createElement('button');
        button.id = algorithm.name;
        button.textContent = algorithm.text;
        button.title = algorithm.title;

        button.addEventListener('click', () => {
            handleAlgorithmClick(algorithm, edgesRaw, nodes, directed, weighted, nameInput.value, methodsElement);
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
    });
    graphContent.appendChild(methodsElement);

    // Resizing for methodsElement
    const topResizeHandle = document.createElement('div');
    topResizeHandle.className = 'top-resize-handle';
    // Resizing logic
    topResizeHandle.addEventListener('mousedown', (e) => {
        handleTopResizeMouseDown(e, methodsElement, container);
    });

    // End of resizing for methodsElement
    methodsElement.appendChild(topResizeHandle);

    const copyr = document.createElement('div');
    copyr.style.display = 'inline-block';
    copyr.style.margin = '5px 0px 0px 10px';
    copyr.innerHTML = '© 2025 arx-net';
    methodsElement.appendChild(copyr);

    const methodsElementToggle = document.createElement('button');
    methodsElementToggle.id = 'methodsElementToggle';
    methodsElementToggle.innerHTML = '&#9776'; // Hamburger menu
    methodsElementToggle.title = 'Toggle visibility for called methods on this graph';
    methodsElementToggle.addEventListener('click', () => {
        methodsElement.style.display = methodsElement.style.display === 'block' ? 'none' : 'block';
    })
    operationPanel.appendChild(methodsElementToggle);

    const closeButtonME = document.createElement('button');
    closeButtonME.className = 'closeButtonME'
    closeButtonME.innerHTML = '&#10005;';
    closeButtonME.title = 'Close graph methods window';
    closeButtonME.addEventListener('click', () => {
        methodsElementToggle.click();
    })
    methodsElement.appendChild(closeButtonME);

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
        menu.className = 'floating-menu';
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        // Helper to add menu items
        function addMenuItem(label, title, onClick) {
            const item = document.createElement('button');
            item.textContent = label;
            item.title = title;
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
            deleteThisGraph.click();
        });

        // Create new vertex
        addMenuItem('Create new vertex', 'Add a new vertex to this graph', () => {
            let newVertex = prompt("Enter new vertex name (e.g., A, B, C):");
            if (newVertex) {
                newVertex = newVertex.toUpperCase();
                if (nodes.some(node => node.id === newVertex)) {
                    alert(`Vertex ${newVertex} already exists.`);
                } else {
                    // Place the new node at the cursor
                    // Calculate the SVG coordinates corresponding to the mouse position
                    const pt = svg.node().createSVGPoint();
                    pt.x = event.clientX;
                    pt.y = event.clientY;
                    const svgP = pt.matrixTransform(svg.node().getScreenCTM().inverse());
                    const centerX = svgP.x;
                    const centerY = svgP.y;
                    nodes.push({ id: newVertex, x: centerX, y: centerY, vx: 0, vy: 0 });

                    let nodeSelection = nodeLayer.selectAll('circle')
                        .data(nodes, d => d.id);

                    // 3. Handle new nodes with enter()
                    let nodeEnter = nodeSelection.enter()
                        .append('circle')
                        .attr('r', 20)
                        .attr('fill', nodeColor)
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y)
                        .on('mouseover', function () {
                            d3.select(this).attr('fill', nodeHoverColor);
                        })
                        .on('mouseout', function () {
                            d3.select(this).attr('fill', nodeColor);
                        })
                        .call(
                            d3.drag()
                                .on('start', function (event, d) {
                                    dragStarted(event, d, simulation, this);
                                })
                                .on('drag', function (event, d) {
                                    dragged(event, d, this);
                                })
                                .on('end', function (event, d) {
                                    dragEnded(event, d, simulation, useForceCheckbox.checked, this);
                                })
                        )
                        .on('contextmenu', function (event, d) {
                            event.preventDefault();
                            event.stopPropagation();

                            // Create context menu
                            const menu = document.createElement('div');
                            menu.className = 'floating-menu';
                            menu.style.position = 'fixed';
                            menu.style.left = `${event.clientX}px`;
                            menu.style.top = `${event.clientY}px`;

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

                            // Create new edge
                            const newEdgeButton = document.createElement('button');
                            newEdgeButton.textContent = 'Create new edge from this vertex';
                            newEdgeButton.onclick = () => {
                                let targetId = prompt("Enter target vertex id:").toUpperCase();
                                if (!targetId) {
                                    menu.remove();
                                    return;
                                }
                                const targetNode = nodes.find(n => n.id === targetId);
                                if (!targetNode) {
                                    menu.remove();
                                    alert("Target vertex does not exist.");
                                    return;
                                }
                                let weight = 1;
                                if (weighted) {
                                    let w = prompt("Enter weight for this edge:", "1");
                                    if (w === null) {
                                        menu.remove();
                                        return;
                                    }
                                    weight = parseFloat(w);
                                    if (isNaN(weight)) {
                                        alert("Invalid weight.");
                                        menu.remove();
                                        return;
                                    }
                                }
                                // Check if the reverse edge exists (i.e., bidirectional)
                                const reverseEdge = edges.find(e => e.source === targetNode && e.target === d);
                                const isSelfLoop = d.id === targetId;
                                if (isSelfLoop) {
                                    edges.push({ source: d, target: targetNode, weight, selfLoop: true })
                                } else if (reverseEdge) {
                                    // Mark both edges as bidirectional
                                    edges.push({ source: d, target: targetNode, weight, bidirectional: true });
                                    reverseEdge.bidirectional = true;
                                } else {
                                    edges.push({ source: d, target: targetNode, weight });
                                }

                                edgesRaw.push({ source: d.id, target: targetNode.id, weight });
                                // Re-bind data and redraw links and edge labels
                                link = edgeLayer.selectAll('.link')
                                    .data(edges)
                                    .join(
                                        enter => enter.append('path')
                                            .attr('class', 'link')
                                            .attr('source-id', d => `${arrowId}${d.source.id}`)
                                            .attr('target-id', d => `${arrowId}${d.target.id}`)
                                            .attr('fill', 'none')
                                            .attr('stroke', edgeColor)
                                            .attr('stroke-width', 1.5)
                                            .on('mouseover', function () {
                                                handleEdgeMouseOver(this, edgeHoverColor, directed, svgElement);
                                            })
                                            .on('mouseout', function () {
                                                handleEdgeMouseOut(this, edgeColor, directed, svgElement);
                                            })
                                            .on('contextmenu', function (event, d) {
                                                showEdgeContextMenu(event, d, svg, edgeLabel, edges, edgesRaw, node, label, directed, weighted, arrowId, link, link2);
                                            }),
                                        update => update,
                                        exit => exit.remove()
                                    );

                                // Re-bind data and redraw buffer links for edge hover/click
                                link2 = edgeBufferLayer.selectAll('.link2')
                                    .data(edges)
                                    .join(
                                        enter => enter.append('path')
                                            .attr('class', 'link2')
                                            .attr('fill', 'none')
                                            .attr('stroke', 'transparent')
                                            .attr('stroke-width', 20)
                                            .style('pointer-events', 'stroke')
                                            .on('mouseover', function (event, d) {
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
                                            }),
                                        update => update,
                                        exit => exit.remove()
                                    );

                                // If weighted, update edge labels
                                if (weighted) {
                                    edgeLabel.exit().remove();
                                    edgeLabel = labelLayer.selectAll('.edge-label')
                                        .data(edges)
                                        .join(
                                            enter => enter.append('text')
                                                .attr('class', 'edge-label')
                                                .attr('font-size', 18)
                                                .attr('fill', edgeWeightColor)
                                                .text(d => d.weight)
                                                .style('pointer-events', 'none'),
                                            update => update.text(d => d.weight),
                                            exit => exit.remove()
                                        );
                                }

                                // Update positions
                                setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
                                setEdgePositions(link2, edgeLabel, node, label, directed, weighted, svg, arrowId);

                                menu.remove();
                            }
                            menu.appendChild(newEdgeButton);

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

                    // 4. Remove old nodes (optional, not always needed)
                    nodeSelection.exit().remove();

                    // 5. Merge new and existing nodes if needed later
                    node = nodeEnter.merge(nodeSelection);

                    // Update labels
                    let labelSelection = labelLayer.selectAll('text')
                        .data(nodes, d => d.id);

                    // ENTER: Add new labels
                    let labelEnter = labelSelection.enter()
                        .append('text')
                        .attr('dy', 3)
                        .attr('text-anchor', 'middle')
                        .text(d => d.id)
                        .attr('font-size', 16)
                        .attr('fill', nodeLabelColor)
                        .style('pointer-events', 'none')
                        .style('font-weight', 'bold');

                    // EXIT: Remove labels for removed nodes (optional)
                    // labelSelection.exit().remove();

                    // MERGE: Combine enter and update selections
                    label = labelEnter.merge(labelSelection);
                    setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
                }
            }
        })

        addMenuItem('Save as PNG', 'Save this graph as a PNG image', () => {
            saveSvgAsPng(svgElement, `${nameInput.value}.png`);
        });
        addMenuItem('Save as transparent PNG', 'Save this graph as a PNG image with a transparent background', () => {
            saveSvgAsPng(svgElement, `${nameInput.value}.png`, true);
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
        setContainerPosition(e, container, fullScreenButton);
    });
    /* End of drag functionality */

    /* Resize functionality */
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            handleResizeStart(e, handle, container);
        });
    });
    /* End of resize functionality */

    // Full screen button
    fullScreenButton.addEventListener('click', () => {
        toggleContainerFullScreen(container, focusAndCenterContainer);
    });

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
    showHideDeleteDiv.appendChild(nameInput);
    nameInput.type = 'text';
    nameInput.value = displayName;
    nameInput.title = displayName;
    nameInput.autocomplete = 'off';
    nameInput.spellcheck = false;
    // Initially disable input
    nameInput.setAttribute('readonly', true);

    // Enable editing on double-click and apply styling
    nameInput.addEventListener('dblclick', () => {
        enableGraphNameEditing(nameInput, displayName);
    });

    // Disable editing on blur and enter key press
    nameInput.addEventListener('keydown', (event) => {
        handleGraphNameInput(event, nameInput);
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

    showHideDeleteDiv.id = nameInput.value;
    /* End of graph name functionality */

    /* Outliner graph functionalities */
    // Show/hide graph functionality
    const showHideGraph = document.createElement('button');
    showHideGraph.title = 'Show/hide graph';
    showHideGraph.className = 'showHideCurrentGraph';
    const showHideImg = document.createElement('img');
    showHideImg.src = 'images/show.png';
    showHideGraph.appendChild(showHideImg);
    showHideGraph.addEventListener('click', () => {
        container.style.display === 'none' ? container.style.display = 'block' : container.style.display = 'none';
        showHideImg.src = container.style.display === 'none' ? 'images/hide.png' : 'images/show.png';
    });
    closeButton.addEventListener('click', () => {
        showHideGraph.click();
    }); // Adding it to the close button as well

    // Focus on graph functionality
    const focusButton = document.createElement('button');
    focusButton.title = 'Focus on this graph';
    const focusImg = document.createElement('img');
    focusImg.src = 'images/focus.png';
    focusButton.appendChild(focusImg);
    focusButton.addEventListener('click', () => {
        if (container.style.display === 'none') showHideGraph.click();
        focusAndCenterContainer(container);
    });

    /* General graph methods div */
    const graphOptions = document.createElement('div');
    graphOptions.className = 'floating-menu';
    graphOptions.style.display = 'none';

    const duplicateGraph = document.createElement('button'); // Duplicate graph with weights and directions turned on/off
    duplicateGraph.textContent = 'Duplicate graph';
    duplicateGraph.title = 'Duplicate this graph';

    duplicateGraph.addEventListener('click', () => {
        let edgesRawString = stringifyEdges(edgesRaw);
        addGraph(edgesRawString, nodes, `${nameInput.value} copy`);
        graphOptions.style.display = "none";
    });

    const deleteThisGraph = document.createElement('button'); // Delete this graph
    deleteThisGraph.className = 'deleteCurrentGraph';
    deleteThisGraph.textContent = 'Delete graph';
    deleteThisGraph.title = 'Delete this graph';
    deleteThisGraph.addEventListener('click', () => {
        deleteGraph(container, displayName);
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

    // Mouse wheel zoom
    container.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            zoomIn(svg, grid);
        } else {
            zoomOut(svg, grid);
        }
    });
    /* End of zoom functionality */

    /* Pan functionality to middle mouse hold or Ctrl + LMB and drag */
    /* Pan functionality functions */
    svg.on('mousedown', (event) => {
        svgPanStart(event);
    });
    svg.on('mousemove', (event) => {
        svgPanMove(event, svg, drawGrid, grid);
    });
    svg.on('mouseup', () => {
        svgPanEnd();
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
            if (directed) { // Undirected graphs cannot have bidirectional edges
                edge.bidirectional = true;
            }
        }
        if (edge.source === edge.target) {
            edge.selfLoop = true; // Mark self-loops
        }
    });

    // Create nodes from edges
    if (nodes === null) {
        nodes = Array.from(
            new Set(edges.flatMap(edge => [edge.source, edge.target]))
        ).map(id => ({ id }));

        const vertexData = graphInputVertices.value.trim().toUpperCase();
        const vertices = vertexData.split(',').map(v => v.trim()).filter(v => v !== "");

        if (vertices.length > 0) {
            let extraVertices = vertices.map(v => ({ id: v }));
            const combined = [...nodes, ...extraVertices];
            nodes = Array.from(new Map(combined.map(n => [n.id, n])).values());
        }
    }

    /* End of graph elements creation */

    /* Force simulation values */
    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(300))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

    /* End of Force simulation values */

    // Control simulation forces with the use force checkbox
    useForceCheckbox.addEventListener('change', function () {
        if (this.checked) {
            enableForceSimulation(simulation, edges, width, height);
        } else {
            disableForceSimulation(simulation);
        }
    });

    const edgeLayer = svg.append('g').attr('id', 'edge-layer');
    const edgeBufferLayer = svg.append('g').attr('id', 'edge-buffer-layer');
    const nodeLayer = svg.append('g').attr('id', 'node-layer');
    const labelLayer = svg.append('g').attr('id', 'label-layer');

    /* Drawing the graph */
    // Draw links
    let link = edgeLayer.selectAll('.link')
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
            handleEdgeMouseOver(this, edgeHoverColor, directed, svgElement);
        })
        .on('mouseout', function () {
            handleEdgeMouseOut(this, edgeColor, directed, svgElement);
        })
        .on('contextmenu', function (event, d) {
            showEdgeContextMenu(event, d, svg, edgeLabel, edges, edgesRaw, node, label, directed, weighted, arrowId, link, link2);
        });


    // Buffer size for edge hover
    let link2 = edgeBufferLayer.selectAll('.link2')
        .data(edges)
        .enter()
        .append('path')
        .attr('class', 'link2')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 20)
        .style('pointer-events', 'stroke')  // Make only the stroke area interactive
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
    let node = nodeLayer.selectAll('circle')
        .data(nodes, d => d.id)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('fill', nodeColor)
        .on('mouseover', function () {
            d3.select(this).attr('fill', nodeHoverColor);
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
            menu.className = 'floating-menu';
            menu.style.position = 'fixed';
            menu.style.left = `${event.clientX}px`;
            menu.style.top = `${event.clientY}px`;

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

            // Create new edge
            const newEdgeButton = document.createElement('button');
            newEdgeButton.textContent = 'Create new edge from this vertex';
            newEdgeButton.onclick = () => {
                let targetId = prompt("Enter target vertex id:").toUpperCase();
                if (!targetId) {
                    menu.remove();
                    return;
                }
                const targetNode = nodes.find(n => n.id === targetId);
                if (!targetNode) {
                    menu.remove();
                    alert("Target vertex does not exist.");
                    return;
                }
                let weight = 1;
                if (weighted) {
                    let w = prompt("Enter weight for this edge:", "1");
                    if (w === null) {
                        menu.remove();
                        return;
                    }
                    weight = parseFloat(w);
                    if (isNaN(weight)) {
                        alert("Invalid weight.");
                        menu.remove();
                        return;
                    }
                }
                // Check if the reverse edge exists (i.e., bidirectional)
                const reverseEdge = edges.find(e => e.source === targetNode && e.target === d);
                const isSelfLoop = d.id === targetId
                if (isSelfLoop) {
                    edges.push({ source: d, target: targetNode, weight, selfLoop: true })
                } else if (reverseEdge) {
                    // Mark both edges as bidirectional
                    edges.push({ source: d, target: targetNode, weight, bidirectional: true });
                    reverseEdge.bidirectional = true;
                } else {
                    edges.push({ source: d, target: targetNode, weight });
                }

                edgesRaw.push({ source: d.id, target: targetNode.id, weight });
                // Re-bind data and redraw links and edge labels
                link = edgeLayer.selectAll('.link')
                    .data(edges)
                    .join(
                        enter => enter.append('path')
                            .attr('class', 'link')
                            .attr('source-id', d => `${arrowId}${d.source.id}`)
                            .attr('target-id', d => `${arrowId}${d.target.id}`)
                            .attr('fill', 'none')
                            .attr('stroke', edgeColor)
                            .attr('stroke-width', 1.5)
                            .on('mouseover', function () {
                                handleEdgeMouseOver(this, edgeHoverColor, directed, svgElement);
                            })
                            .on('mouseout', function () {
                                handleEdgeMouseOut(this, edgeColor, directed, svgElement);
                            })
                            .on('contextmenu', function (event, d) {
                                showEdgeContextMenu(event, d, svg, edgeLabel, edges, edgesRaw, node, label, directed, weighted, arrowId, link, link2);
                            }),
                        update => update,
                        exit => exit.remove()
                    );

                // Re-bind data and redraw buffer links for edge hover/click
                link2 = edgeBufferLayer.selectAll('.link2')
                    .data(edges)
                    .join(
                        enter => enter.append('path')
                            .attr('class', 'link2')
                            .attr('fill', 'none')
                            .attr('stroke', 'transparent')
                            .attr('stroke-width', 20)
                            .style('pointer-events', 'stroke')
                            .on('mouseover', function (event, d) {
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
                            }),
                        update => update,
                        exit => exit.remove()
                    );

                // If weighted, update edge labels
                if (weighted) {
                    edgeLabel.exit().remove();
                    edgeLabel = labelLayer.selectAll('.edge-label')
                        .data(edges)
                        .join(
                            enter => enter.append('text')
                                .attr('class', 'edge-label')
                                .attr('font-size', 18)
                                .attr('fill', edgeWeightColor)
                                .text(d => d.weight)
                                .style('pointer-events', 'none'),
                            update => update.text(d => d.weight),
                            exit => exit.remove()
                        );
                }

                // Update positions
                setEdgePositions(link, edgeLabel, node, label, directed, weighted, svg, arrowId);
                setEdgePositions(link2, edgeLabel, node, label, directed, weighted, svg, arrowId);

                menu.remove();
            }
            menu.appendChild(newEdgeButton);

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
    let label = labelLayer.selectAll('text')
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
        edgeLabel = labelLayer.selectAll('.edge-label')
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
