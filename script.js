let gameBoard = document.getElementById('game-board');
let boardSize = 40; // Adjusted for a larger grid
let dropArea = document.getElementById('drop-area');
let startColor = { r: 85, g: 0, b:170 }; // Blue
let endColor = { r: 208, g: 255, b: 115 }; // Green
let contrastSlider = document.getElementById('contrast-slider');
let brightnessSlider = document.getElementById('brightness-slider');
let currentImageSrc = null; // Store the current image src for updates
let invertSwitch = document.getElementById('invert-switch');

let toggleButton = document.getElementById('toggle-view');
let isIsometric = false;  // A flag to check the current view mode
let blurSlider = document.getElementById('blur-slider');

let gridSizeSlider = document.getElementById('grid-size-slider');
let gridSizeDisplay = document.getElementById('grid-size-display');

let boardSizeSlider = document.getElementById('board-size-slider');
let boardSizeDisplay = document.getElementById('board-size-display');

let includeBackgroundCheckbox = document.getElementById('include-background');

let hideSmallestDotsCheckbox = document.getElementById('hide-smallest-dots');



function computeIntermediateColor(start, end, steps, step) {
    let r = Math.round(start.r + (step * (end.r - start.r)) / steps);
    let g = Math.round(start.g + (step * (end.g - start.g)) / steps);
    let b = Math.round(start.b + (step * (end.b - start.b)) / steps);
    return `rgb(${r}, ${g}, ${b})`;
}

// Prevent default behaviors for drag & drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight the drop area during dragging for better UX
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});



function highlight() {
    dropArea.style.border = '4px dashed #FFF';
    dropArea.style.backgroundColor = 'rgba(0,0,0,0.3)';
}

function unhighlight() {
    dropArea.style.border = '';
    dropArea.style.backgroundColor = 'rgba(0,0,0,0)';
}





function updateBoardSize() {
    let boardSizeValue = parseInt(boardSizeSlider.value);
    boardSizeDisplay.textContent = boardSizeValue;

    // Adjust the board size
    gameBoard.style.width = `${boardSizeValue}px`;
    gameBoard.style.height = `${boardSizeValue}px`;

    // Adjust cell size based on the new board size and board grid size
    let cellSize = boardSizeValue / boardSize; 

    // Update the game board grid template styles
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;

    // Re-render the image with the new board and cell sizes
    if (currentImageSrc) {
        let contrast = contrastSlider.value;
        let brightness = brightnessSlider.value;
        renderImageWithAdjustments(currentImageSrc, contrast, brightness);
    }
}

// Attach event listener to the board size slider
boardSizeSlider.addEventListener('input', updateBoardSize);


// Handle the drop event
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    // Check if the drop target is the game-board or a direct child
    if (e.target === dropArea || e.target.parentNode === dropArea) {
        let dt = e.dataTransfer;
        let file = dt.files[0];

        // Fetch the initial values from the sliders
        let contrast = contrastSlider.value;
        let brightness = brightnessSlider.value;
        handleImage(file, contrast, brightness);
    }
    dropArea.style.pointerEvents = 'none';
    document.getElementById('drag-placeholder').style.display = 'none';
updateBoardSize();
updateGridSize();
}

function clearDropArea() {
    gameBoard.innerHTML = ''; // or any function where you clear the area
    dropArea.style.pointerEvents = 'auto';
}



function handleImage(file, contrast = 100, brightness = 100) {
  gameBoard.innerHTML = '';

    let reader = new FileReader();
    reader.onload = function(event) {
        currentImageSrc = event.target.result;
        renderImageWithAdjustments(currentImageSrc, contrast, brightness);
    };
    reader.readAsDataURL(file);
  
  
}

function renderImageWithAdjustments(src, contrast, brightness) {
   console.log('Rendering image with contrast:', contrast, 'and brightness:', brightness);
    let img = new Image();
    img.onload = function() {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = boardSize;
        canvas.height = boardSize;

        
        // Apply contrast and brightness and blur adjustments
      ctx.filter = `contrast(${contrast}%) brightness(${brightness}%) blur(${blurSlider.value}px)`;

      

      
        ctx.drawImage(img, 0, 0, boardSize, boardSize);

        // Clear the game board
        gameBoard.innerHTML = '';


        // Populate the grid with dots based on pixel data
        for(let y = 0; y < boardSize; y++) {
            for(let x = 0; x < boardSize; x++) {
                let pixel = ctx.getImageData(x, y, 1, 1).data;
                let dot = createDotFromPixel(pixel);
                gameBoard.appendChild(dot);
            }
        }
    };
    img.src = src;
}

function createDotFromPixel(pixel) {
    let dot = document.createElement('div');
    let brightness = (pixel[0] + pixel[1] + pixel[2]) / 3; 
    let intensity = Math.round(brightness / 255 * 14); 

    if (invertSwitch.checked) {
        intensity = 14 - intensity;
    }

    let color = computeIntermediateColor(startColor, endColor, 14, intensity);
    dot.style.backgroundColor = color;

    let boardSizeValue = parseInt(boardSizeSlider.value);  // Get the current board size from the slider
    let baseSize = boardSizeValue / 800;  // Calculate the scaling factor

    let size = (2 + (intensity * 1.5)) * baseSize; // Adjust the base size based on scaling factor
    dot.style.borderRadius = `${(12 - intensity) * baseSize}px`;
    dot.style.height = `${size}px`;
    dot.style.width = `${size}px`;
    dot.style.margin = `${(12 - intensity) * baseSize}px`; 


// Check if the checkbox is checked and the size of the dot is the smallest
if (hideSmallestDotsCheckbox.checked && size === (2 * baseSize)) {
    dot.style.visibility = 'hidden';
} else {
    dot.style.visibility = 'visible';
}


    return dot;
}


hideSmallestDotsCheckbox.addEventListener('input', updateImage);




function updateImage() {
 
    if (currentImageSrc) {
        let contrast = contrastSlider.value;
        let brightness = brightnessSlider.value;
        renderImageWithAdjustments(currentImageSrc, contrast, brightness);
    }
}




// Attach event listeners to the sliders for real-time adjustments
contrastSlider.addEventListener('input', updateImage);
brightnessSlider.addEventListener('input', updateImage);
invertSwitch.addEventListener('input', updateImage);
blurSlider.addEventListener('input', updateImage);





toggleButton.addEventListener('click', function() {
    if (isIsometric) {
        gameBoard.classList.remove('isometric');
        toggleButton.textContent = 'Toggle Isometric View';
    } else {
        gameBoard.classList.add('isometric');
        toggleButton.textContent = 'Toggle Normal View';
    }
    isIsometric = !isIsometric;
});



//grid size
function updateGridSize() {
    boardSize = parseInt(gridSizeSlider.value);
    gridSizeDisplay.textContent = boardSize*boardSize;
    
 let boardSizeValue = parseInt(boardSizeSlider.value);
let cellSize = boardSizeValue / boardSize;

    // Update the game board grid template styles
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;




    // Re-render the image with the new grid size
    if (currentImageSrc) {
        let contrast = contrastSlider.value;
        let brightness = brightnessSlider.value;
        renderImageWithAdjustments(currentImageSrc, contrast, brightness);
    }


}


gridSizeSlider.addEventListener('input', updateGridSize);





//theme (colors)
const themes = {
    theme1: {
        startColor: { r: 228, g: 80, b: 241 },
        endColor: { r: 209, g: 255, b: 113 },
        backgroundColor: "#15282E"
    },
    theme2: {
        startColor: { r: 2, g: 37, b: 172 },
        endColor: { r: 2, g: 37, b: 172 },
        backgroundColor: "#C2DDFF"
    },
        theme3: {
        startColor: { r: 45, g: 109, b: 246 },
        endColor: { r: 241, g: 125, b: 143 },
        backgroundColor: "#0C1D22"
    },
            theme4: {
        startColor: { r: 45, g: 109, b: 246 },
        endColor: { r: 44, g: 107, b: 244 },
        backgroundColor: "#0C1D22"
    },
            theme5: {
       startColor: { r: 228, g: 75, b: 244 },
        endColor: { r: 209, g: 255, b: 113 },
        backgroundColor: "#0225AC"
    },
    // ... define other themes ...
};


let themeButtons = document.querySelectorAll('.theme-button');


themeButtons.forEach(button => {
    button.addEventListener('click', function() {
        let themeKey = button.getAttribute('data-theme');
        applyTheme(themes[themeKey]);
    });
});


function applyTheme(theme) {
    // Apply the background color
    document.body.style.backgroundColor = theme.backgroundColor;

    // Update the startColor and endColor
    startColor = theme.startColor;
    endColor = theme.endColor;

    // Re-render the image with the new theme colors
    if (currentImageSrc) {
        let contrast = contrastSlider.value;
        let brightness = brightnessSlider.value;
        renderImageWithAdjustments(currentImageSrc, contrast, brightness);
    }
}






//export
let exportBtn = document.getElementById('export-png-btn');

exportBtn.addEventListener('click', function() {
    let canvas = document.createElement('canvas');
    canvas.width = gameBoard.offsetWidth * 2;  // 2x for higher resolution
    canvas.height = gameBoard.offsetHeight * 2; // 2x for higher resolution
    let ctx = canvas.getContext('2d');

    // Fill the canvas with the current background color
if (!includeBackgroundCheckbox.checked) {
    // Fill the canvas with the current background color
    let bgColor = getComputedStyle(document.body).backgroundColor;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



// Convert each grid cell (dot) into pixels on the canvas
gameBoard.childNodes.forEach(dot => {
    let rect = dot.getBoundingClientRect();
    let color = getComputedStyle(dot).backgroundColor;
    let radius = (rect.width * 2) / 2; // 2x resolution, so we double the width
    let borderRadius = parseFloat(getComputedStyle(dot).borderRadius);




 
    // Check if isometric view is enabled and apply transformation
    let x = rect.left * 2;
    let y = rect.top * 2;
    if (isIsometric) {
        let transformed = transformIsometric(x, y);
        x = transformed.x;
        y = transformed.y;
    }
  if (getComputedStyle(dot).visibility === 'hidden') return;

    // If the borderRadius is close to the radius (meaning it's almost a full circle), draw a circle.
    // Otherwise, draw a rounded rectangle.
    if (borderRadius >= radius * 0.9) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(rect.left * 2 + radius, rect.top * 2 + radius, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    } else {
        drawRoundedRect(ctx, rect.left * 2, rect.top * 2, rect.width * 2, rect.height * 2, borderRadius * 2, color);
    }
});


// Helper function to apply isometric transformation
function transformIsometric(x, y) {
    return {
        x: x - y,
        y: (x + y) / 2
    };
}



    // Trigger a download
    let link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'exported_image.png';
    link.click();
});




//export SVG
let exportSvgBtn = document.getElementById('export-svg-btn');

exportSvgBtn.addEventListener('click', function() {

    let svgNS = "http://www.w3.org/2000/svg";
    let svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('width', gameBoard.offsetWidth);
    svg.setAttribute('height', gameBoard.offsetHeight);

    // Create a background rectangle
if (!includeBackgroundCheckbox.checked) {
    let bgColor = getComputedStyle(document.body).backgroundColor;
    let backgroundRect = document.createElementNS(svgNS, 'rect');
    backgroundRect.setAttribute('width', '100%');
    backgroundRect.setAttribute('height', '100%');
    backgroundRect.setAttribute('fill', bgColor);
    svg.appendChild(backgroundRect);
}

    gameBoard.childNodes.forEach(dot => {
        let rect = dot.getBoundingClientRect();
        let color = getComputedStyle(dot).backgroundColor;
        let radius = rect.width / 2;
        let borderRadius = parseFloat(getComputedStyle(dot).borderRadius);

        let shape;
          if (getComputedStyle(dot).visibility === 'hidden') return;
        if (borderRadius >= radius * 0.9) {
            shape = document.createElementNS(svgNS, 'circle');
            shape.setAttribute('cx', rect.left + radius);
            shape.setAttribute('cy', rect.top + radius);
            shape.setAttribute('r', radius);
        } else {
            shape = document.createElementNS(svgNS, 'rect');
            shape.setAttribute('x', rect.left);
            shape.setAttribute('y', rect.top);
            shape.setAttribute('width', rect.width);
            shape.setAttribute('height', rect.height);
            shape.setAttribute('rx', borderRadius);
            shape.setAttribute('ry', borderRadius);
        }
        
        shape.setAttribute('fill', color);
        svg.appendChild(shape);
    });

    // Serialize SVG to string and trigger download
    let serializer = new XMLSerializer();
    let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg);
    let url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    let link = document.createElement('a');
    link.href = url;
    link.download = 'exported_image.svg';
    link.click();
});






// Helper function to draw a rounded rectangle on a canvas
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}



document.addEventListener('dragover', function() {
    document.querySelector('#drop-area').style.pointerEvents = 'all';
});

document.addEventListener('dragend', function() {
    document.querySelector('#drop-area').style.pointerEvents = 'none';
});






document.getElementById('flip-btn').addEventListener('click', function() {
    const flipContainer = document.querySelector('.flip-container');
    flipContainer.classList.toggle('flipped');
});

