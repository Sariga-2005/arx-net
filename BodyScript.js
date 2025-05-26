/* Add graph on enter key press */
const allGraphControls = document.querySelector('.allGraphControls');
document.getElementById('edges').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addGraph();
    }
});

/* Show controls common to all graphs on right click */
outliner.addEventListener('contextmenu', function (event) {
    // event.preventDefault(); // Prevent the default context menu

    // Get the mouse position relative to the viewport
    const x = event.clientX - 50;
    const y = event.clientY - 10;

    // Get the dimensions of the viewport and the menu
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = allGraphControls.offsetWidth;
    const menuHeight = allGraphControls.offsetHeight;

    // Calculate the maximum allowed position to keep the menu within the viewport
    const maxX = viewportWidth - menuWidth;
    const maxY = viewportHeight - menuHeight;

    // Adjust the menu position to stay within bounds
    allGraphControls.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    allGraphControls.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;

    // Display the menu
    allGraphControls.style.display = 'block';
});

// Hide the menu when clicking outside
allGraphControls.addEventListener('mouseleave', function () {
    allGraphControls.style.display = 'none';
});
/* End of show controls common to all graphs on right click */

/* Add functionality to the controls */
document.getElementById('closeAll').addEventListener('click', function () {
    outliner.querySelectorAll('.showHideDeleteDiv').forEach(item => {
        const eyeBtn = item.querySelector('button:nth-last-child(2)'); // Second last button is the visibility button
        if (eyeBtn && eyeBtn.querySelector('img')?.src.endsWith('show.png')) {
            eyeBtn.click();
        }
    });
    allGraphControls.style.display = 'none';
});

document.getElementById('showAll').addEventListener('click', function () {
    outliner.querySelectorAll('.showHideDeleteDiv').forEach(item => {
        const eyeBtn = item.querySelector('button:nth-last-child(2)'); // Last button is the visibility button
        if (eyeBtn && eyeBtn.querySelector('img')?.src.endsWith('hide.png')) {
            eyeBtn.click();
        }
    });
    allGraphControls.style.display = 'none';
});

document.getElementById('clearAll').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete all graphs? (This action cannot be undone)')) {
        document.querySelectorAll('.graphContainer').forEach(function (item) {
            item.remove();
        });
        document.querySelectorAll('.showHideDeleteDiv').forEach(function (item) {
            item.remove();
        });
    }
    allGraphControls.style.display = 'none';
});
/* End of add functionality to the controls */

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
});

snap.addEventListener('click', function () {
    snapping = !snapping;
    const img = snap.getElementsByTagName('img')[0];
    img.src = snapping ? 'enablesnap.png' : 'disablesnap.png';
});

// Enable if sidebar hiding code is required
// document.getElementById('sidebar').addEventListener('click', function () {
//     containerAll.style.display = containerAll.style.display === 'none' ? 'block' : 'none';
// });
