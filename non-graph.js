// About section functionality
const aboutBtn = document.getElementById('about');
const aboutDiv = document.getElementById('aboutDiv');

function handleOutsideClickAbout(event) {
    if (!aboutDiv.contains(event.target) && event.target !== aboutBtn) {
        aboutDiv.style.display = 'none';
        document.removeEventListener('click', handleOutsideClickAbout);
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
        outliner.style.height = '82vh';
    }
})

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

// Maximum edges calculation functionality
const selfLoops = document.getElementById('selfLoops')
const duplicateEdges = document.getElementById('duplicateEdges')
const isDirected = document.getElementById('directed')

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