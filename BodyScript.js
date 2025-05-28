/* Add graph on enter key press */
const allGraphControls = document.querySelector('.allGraphControls');
document.getElementById('edges').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addGraph();
    }
});

const view4 = document.getElementById('view4');
const view9 = document.getElementById('view9');
const snap = document.getElementById('snap')
let view4gen = false;
let view9gen = false;
let snapping = false

view4.addEventListener('click', function () {
    const img = view4.getElementsByTagName('img')[0];
    if (img.src.endsWith('enable4g.png')) { // Button is enabled here, actions to disable
        img.src = 'disable4g.png';
        view4gen = false;
    } else { // Button is disabled here, actions to enable
        img.src = 'enable4g.png';
        view9.getElementsByTagName('img')[0].src = 'disable9g.png';
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
        img.src = 'disable9g.png';
        view9gen = false;
    } else { // Button is disabled here, actions to enable
        img.src = 'enable9g.png';
        view4.getElementsByTagName('img')[0].src = 'disable4g.png';
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

snap.addEventListener('click', function () {
    snapping = !snapping;
    const img = snap.getElementsByTagName('img')[0];
    img.src = snapping ? 'enablesnap.png' : 'disablesnap.png';
});


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

const showHideAll = document.getElementById('showHideAll')
const clearAll = document.getElementById('clearAll')

let show = true
showHideAll.addEventListener('click', () => {
    const allGraphs = document.getElementsByClassName('showHideCurrentGraph');
    if (show) {
        Array.from(allGraphs).forEach(itemGraph => {
            const img = itemGraph.getElementsByTagName('img')[0];
            if (img && img.src.endsWith('show.png')) {
                itemGraph.click();
            }
        })
        show = false;
        showHideAll.getElementsByTagName('img')[0].src = 'hide.png'
    } else {
        Array.from(allGraphs).forEach(itemGraph => {
            const img = itemGraph.getElementsByTagName('img')[0];
            if (img && img.src.endsWith('hide.png')) {
                itemGraph.click();
            }
        })
        show = true;
        showHideAll.getElementsByTagName('img')[0].src = 'show.png'
    }
})

clearAll.addEventListener('click', () => {
    if (confirm("Are you sure want to delete all graphs? This action cannot be undone.")) {
        const allGraphs = document.getElementsByClassName('deleteCurrentGraph')
        Array.from(allGraphs).forEach(itemGraph => {
            itemGraph.click();
        })
    }
})

function updateMinMax(){
    const updatedValue = parseInt(document.getElementById("numNodes").value);
    // Check if updatedValue is an integer
    if (!Number.isInteger(Number(updatedValue))) {
        alert("Please enter a valid integer for the number of nodes.");
        document.getElementById("numNodes").value = "";
        return;
    }
    // Update DOM for minVal and maxVal
    // document.getElementById("minRec").innerHTML = updatedValue - 1;
    document.getElementById("maxRec").innerHTML = (updatedValue)*(updatedValue - 1)/2;
}