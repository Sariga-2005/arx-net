/* Add graph on enter key press */
document.getElementById('edges').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addGraph();
    }
});

// Graph scaling functionality
view4.addEventListener('click', function () {
    const img = view4.getElementsByTagName('img')[0];
    if (view4gen) { // Button is enabled here, actions to disable
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
    if (view9gen) { // Button is enabled here, actions to disable
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
snap.addEventListener('click', function () {
    snapping = !snapping;
    const img = snap.getElementsByTagName('img')[0];
    img.src = snapping ? 'images/enablesnap.png' : 'images/disablesnap.png';
});

// Show/Hide All functionality
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
clearAll.addEventListener('click', () => {
    if (confirm('Are you sure want to delete all graphs? This action cannot be undone.')) {
        const allGraphs = document.getElementsByClassName('deleteCurrentGraph')
        Array.from(allGraphs).forEach(itemGraph => {
            itemGraph.click();
        });
    }
});
