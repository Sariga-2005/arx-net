/* Add graph on enter key press */
document.getElementById('edges').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addGraph();
    }
});

// Graph scaling functionality
const view4 = document.getElementById('view4');
const view9 = document.getElementById('view9');
let view4gen = false;
let view9gen = false;

view4.addEventListener('click', function () {
    const img = view4.getElementsByTagName('img')[0];
    if (img.src.endsWith('enable4g.png')) { // Button is enabled here, actions to disable
        img.src = 'images/disable4g.png';
        view4gen = false;
    } else { // Button is disabled here, actions to enable
        img.src = 'images/enable4g.png';
        view9.getElementsByTagName('img')[0].src = 'images/disable9g.png';
        view4gen = true;
        view9gen = false;
        document.querySelectorAll('.graphContainer').forEach(function (item) { // Adjust graph container dimensions
            item.style.width = '37.5%';
            item.style.height = '50%';
        });
    }
    document.querySelectorAll('.methodsElem').forEach(item => {
        item.style.height = '30%';
    })
});

view9.addEventListener('click', function () {
    const img = view9.getElementsByTagName('img')[0];
    if (img.src.endsWith('enable9g.png')) { // Button is enabled here, actions to disable
        img.src = 'images/disable9g.png';
        view9gen = false;
    } else { // Button is disabled here, actions to enable
        img.src = 'images/enable9g.png';
        view4.getElementsByTagName('img')[0].src = 'images/disable4g.png';
        view4gen = false;
        view9gen = true;
        document.querySelectorAll('.graphContainer').forEach(function (item) { // Adjust graph container dimensions
            item.style.width = '25%';
            item.style.height = '33.33%';
        });
    }
    document.querySelectorAll('.methodsElem').forEach(item => {
        item.style.height = '30%';
    })
});


// Graph snapping functionality
const snap = document.getElementById('snap');
let snapping = false;
snap.addEventListener('click', function () {
    snapping = !snapping;
    const img = snap.getElementsByTagName('img')[0];
    img.src = snapping ? 'images/enablesnap.png' : 'images/disablesnap.png';
});

// Show/Hide All functionality
const showHideAll = document.getElementById('showHideAll');
let showHideAllGraphs = true;
showHideAll.addEventListener('click', () => {
    const allGraphs = document.getElementsByClassName('showHideCurrentGraph');
    if (showHideAllGraphs) {
        Array.from(allGraphs).forEach(itemGraph => {
            const img = itemGraph.getElementsByTagName('img')[0];
            if (img && img.src.endsWith('show.png')) {
                itemGraph.click();
            }
        })
        showHideAllGraphs = false;
        showHideAll.getElementsByTagName('img')[0].src = 'images/hide.png';
    } else {
        Array.from(allGraphs).forEach(itemGraph => {
            const img = itemGraph.getElementsByTagName('img')[0];
            if (img && img.src.endsWith('hide.png')) {
                itemGraph.click();
            }
        })
        showHideAllGraphs = true;
        showHideAll.getElementsByTagName('img')[0].src = 'images/show.png';
    }
});

// Clear All functionality
const clearAll = document.getElementById('clearAll')
clearAll.addEventListener('click', () => {
    if (confirm("Are you sure want to delete all graphs? This action cannot be undone.")) {
        const allGraphs = document.getElementsByClassName('deleteCurrentGraph')
        Array.from(allGraphs).forEach(itemGraph => {
            itemGraph.click();
        })
    }
})

/* Global variables in this file:
    * view4gen: Boolean to check if 4G view is enabled
    * view9gen: Boolean to check if 9G view is enabled
    * snapping: Boolean to check if snapping is enabled
    * show: Boolean to check if graphs are shown or hidden
    * aboutBtn: Button to toggle the about section
    * aboutDiv: Div containing the about section
    * showHideAll: Button to show/hide all graphs
    * showHideAllGraphs: Boolean to check if all graphs are shown or hidden
    * clearAll: Button to clear all graphs
    * selfLoops = Checkbox for self-loops
    * duplicateEdges = Checkbox for duplicate edges
    * isDirected = Checkbox for directed graphs
    * connected = Checkbox for connected graphs
    * maxWeight = Input field for maximum weight
    * cgm: Button to toggle the graph generation menu
    * graphGenMenu: Div containing the graph generation menu
    * vertexInput: Input field for vertices
*/
