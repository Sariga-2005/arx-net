/* Add graph on enter key press */
const allGraphControls = document.querySelector('.allGraphControls');
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


// About section functionality
const aboutBtn = document.getElementById('about');
const aboutDiv = document.getElementById('aboutDiv');

function handleOutsideClickAbout(event) {
    if (!aboutDiv.contains(event.target) && event.target !== aboutBtn) {
        aboutDiv.style.display = 'none';
        document.removeEventListener('click', handleOutsideClickAbout);
    }
}

aboutBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    const isVisible = aboutDiv.style.display === 'block';

    if (isVisible) {
        aboutDiv.style.display = 'none';
        document.removeEventListener('click', handleOutsideClickAbout);
    } else {
        aboutDiv.style.display = 'block';
        document.addEventListener('click', handleOutsideClickAbout);
    }
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

// Maximum edges calculation functionality
const selfLoops = document.getElementById('selfLoops')
const duplicateEdges = document.getElementById('duplicateEdges')
const isDirected = document.getElementById('directed')
const connected = document.getElementById('connectedGraph')
const maxWeight = document.getElementById('maxWeight')

function updateMinMax() {
    const updatedValue = parseInt(document.getElementById("numNodes").value);
    const maxRecEl = document.getElementById("maxRec");

    if (!Number.isInteger(updatedValue)) {
        alert("Please enter a valid integer for the number of nodes.");
        document.getElementById("numNodes").value = "";
        return;
    }

    const n = updatedValue;

    if (duplicateEdges.checked) {
        // If duplicate edges are allowed, there's no upper bound
        maxRecEl.innerHTML = '∞';
    } else {
        let maxEdges;
        if (isDirected.checked) {
            if (selfLoops.checked) {
                maxEdges = n * n; // directed with self-loops
            } else {
                maxEdges = n * (n - 1); // directed without self-loops
            }
        } else {
            if (selfLoops.checked) {
                maxEdges = n * (n - 1) / 2 + n; // undirected with self-loops
            } else {
                maxEdges = n * (n - 1) / 2; // undirected without self-loops
            }
        }
        maxRecEl.innerHTML = maxEdges;
    }
}

// Graph generation menu visibility toggle functionality
const cgm = document.getElementById('createGraphMenu')
const graphGenMenu = document.getElementById('sourceInput')
cgm.addEventListener('click', function () {
    if (this.getElementsByTagName('img')[0].src.endsWith('sidebaropen.png')) {
        this.getElementsByTagName('img')[0].src = 'images/sidebarclose.png';
        graphGenMenu.style.display = 'block';
        outliner.style.height = '15vh';
    } else {
        this.getElementsByTagName('img')[0].src = 'images/sidebaropen.png';
        graphGenMenu.style.display = 'none';
        outliner.style.height = '85vh';
    }
})

const vertexInput = document.getElementById('vertices');

/* Global variables in this file:
    * allGraphControls: Queryselector element containing functions common to all graphs
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
