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

// Graph generation menu visibility toggle functionality
cgb.addEventListener('click', function () {
    if (this.getElementsByTagName('img')[0].src.endsWith('sidebaropen.png')) {
        this.getElementsByTagName('img')[0].src = 'images/sidebarclose.png';
        graphGenMenu.style.display = 'block';
        outliner.style.height = '25vh';
    } else {
        this.getElementsByTagName('img')[0].src = 'images/sidebaropen.png';
        graphGenMenu.style.display = 'none';
        outliner.style.height = '84vh';
    }
});

// Maximum edges calculation functionality
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

function saveSvgAsPng(svgElement, filename = 'image.png', isTransparent = false) {
    const rect = svgElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 0.9;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Optionally fill with white background
        ctx.fillStyle = isTransparent? 'transparent' : '#1d1d1d';  // Or transparent if you prefer
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.scale(0.9, 1); // Scale X by 0.9 (reduce width by 10%)
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();


        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    };

    img.onerror = (err) => {
        console.error('Error loading SVG image:', err);
        URL.revokeObjectURL(url);
    };

    // Important: force correct scale by setting width/height attributes
    img.width = width;
    img.height = height;
    img.src = url;
}
