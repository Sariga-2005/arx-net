/* Functions to draw grid */
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