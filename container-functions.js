// Focus on this container 
function focusOnThisContainer(container) {
    document.querySelectorAll('.graphContainer').forEach(c => {
        c.style.zIndex = 1;
        c.style.boxShadow = 'none';
    });
    container.style.zIndex = 2;
    container.style.boxShadow = '0px 0px 16px rgba(0, 0, 0, 0.5)';
}

// Focus on this container and center it in the viewport
function focusAndCenterContainer(container, resize = true, fromCenter = false, oldLeft = null, oldTop = null) {
    if (resize) {
        container.style.height = '50%';
        container.style.width = '37.5%';
    }
    const offsetX = container.offsetWidth / 2;
    const offsetY = container.offsetHeight / 2;

    if (oldLeft !== null && oldTop !== null) {
        container.style.left = oldLeft + 'px';
        container.style.top = oldTop + 'px';
    } else {
        if (!fromCenter) {
            container.style.left = 'calc(37.5% - ' + offsetX + 'px)';
        } else {
            container.style.left = 'calc(50% - ' + offsetX + 'px)';
        }
        container.style.top = 'calc(50% - ' + offsetY + 'px)';
    }
    focusOnThisContainer(container);
}

// Dragging functionality for the container
function setContainerPosition(e, container, fullScreenButton) {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.closest('button')) return;
    e.preventDefault();

    if (isFullScreen) {
        fullScreenButton.click(); // Exit full screen if it is in full screen mode
        container.style.top = (e.clientY - 10) + 'px'; // Offset top by 10px
        container.style.left = (e.clientX - 0.8 * container.offsetWidth) + 'px'; // Offset left by 80% of container width
    }

    let offsetX = e.clientX - container.offsetLeft;
    let offsetY = e.clientY - container.offsetTop;

    function setSnappedContainerPosition(event) {
        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;
        let [snapX, snapY] = snapPosition(x, y);
        container.style.left = `${snapX}px`;
        container.style.top = `${snapY}px`;
    }

    document.addEventListener('mousemove', setSnappedContainerPosition);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', setSnappedContainerPosition);
    }, { once: true });
}

function handleResizeStart(event, handle, container) {
    event.preventDefault();

    if (view4gen) {
        view4.click(); // Disable resizing for 4-graph view
        return;
    } else if (view9gen) {
        view9.click(); // Disable resizing for 9-graph view
        return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = container.offsetWidth;
    const startHeight = container.offsetHeight;
    const startLeft = container.offsetLeft;
    const startTop = container.offsetTop;
    const corner = handle.getAttribute('data-corner');

    function onResizeMouseMove(e) {
        performResize(e, {
            startX, startY, startWidth, startHeight, startLeft, startTop, corner, container
        });
    }

    document.addEventListener('mousemove', onResizeMouseMove);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onResizeMouseMove);
    }, { once: true });
}

/* Window resize functionality */
function performResize(event, { startX, startY, startWidth, startHeight, startLeft, startTop, corner, container }) {
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (corner.includes('right')) {
        newWidth = startWidth + (event.clientX - startX);
    }
    if (corner.includes('left')) {
        newWidth = startWidth - (event.clientX - startX);
        newLeft = startLeft + (event.clientX - startX);
    }
    if (corner.includes('bottom')) {
        newHeight = startHeight + (event.clientY - startY);
    }
    if (corner.includes('top')) {
        newHeight = startHeight - (event.clientY - startY);
        newTop = startTop + (event.clientY - startY);
    }

    const minWidth = window.innerWidth * 0.25;
    const minHeight = window.innerHeight * 0.33;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    if (newWidth > minWidth && newWidth < maxWidth) {
        container.style.width = newWidth + 'px';
        container.style.left = newLeft + 'px';
    }
    if (newHeight > minHeight && newHeight < maxHeight) {
        container.style.height = newHeight + 'px';
        container.style.top = newTop + 'px';
    }
}
/* End of window resize functionality */
