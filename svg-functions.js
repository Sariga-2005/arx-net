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

function zoom(zoomFactor, svg, grid) {
    let viewBox = svg.attr('viewBox').split(' ').map(Number);
    let [minX, minY, viewWidth, viewHeight] = viewBox;

    const newWidth = viewWidth * zoomFactor;
    const newHeight = viewHeight * zoomFactor;
    const offsetX = (viewWidth - newWidth) / 2;
    const offsetY = (viewHeight - newHeight) / 2;

    svg.attr('viewBox', `${minX + offsetX} ${minY + offsetY} ${newWidth} ${newHeight}`);
    drawGrid(svg, grid); // Update grid size dynamically
}

function zoomIn(svg, grid) {
    zoom(0.9, svg, grid); // 10% zoom-in
}

function zoomOut(svg, grid) {
    zoom(1.1, svg, grid); // 10% zoom-out
}

/* SVG pan functionality */
function svgPanStart(event) {
    if (!(event.button === 1 || (event.button === 0 && event.ctrlKey))) return;

    isSvgPanning = true;
    panStartX = event.clientX;
    panStartY = event.clientY;
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
}

function svgPanMove(event, svg, drawGridFn, gridData) {
    if (!isSvgPanning) return;

    const [minX, minY, viewWidth, viewHeight] = svg.attr('viewBox').split(' ').map(Number);
    const dx = (panStartX - event.clientX) * (viewWidth / 600);
    const dy = (panStartY - event.clientY) * (viewHeight / 400);

    svg.attr('viewBox', `${minX + dx} ${minY + dy} ${viewWidth} ${viewHeight}`);
    panStartX = event.clientX;
    panStartY = event.clientY;

    if (typeof drawGridFn === 'function') {
        drawGridFn(svg, gridData);
    }
}

function svgPanEnd() {
    isSvgPanning = false;
    document.body.style.cursor = 'default';
}
/* End of SVG pan functionality */