let draggables = null;
let shiftX = 0;
let shiftY = 0;
let originalX = 0;
let originalY = 0;
let currentDroppable = null;
let zIndex = 10;
let startTime = 0;
let totalPausedDuration = 0;
let timer = null;


const kuihName = document.querySelector(".kuih-name").innerText.toLowerCase().replace(/ /g,'');
document.querySelectorAll(".puzzle-piece").forEach(puzzlePiece => {
    puzzlePiece.style.backgroundImage = `url(/images/${kuihName}/${puzzlePiece.classList[0]}.png)`;
});

//? To shuffle the puzzle pieces
const puzzlePieceContainer = document.querySelector(".puzzle-piece-box");
for (let i = puzzlePieceContainer.childElementCount; i >= 0; i--) {
    puzzlePieceContainer.appendChild(puzzlePieceContainer.children[Math.random() * i | 0]);
}

document.getElementById("start-puzzle-button").addEventListener("click", startPuzzle);

function startPuzzle() {
    startTime = Date.now();
    let pausedTime = 0;
    let isPaused = false;
    let endingTime = startTime + 150000;

    refreshDraggables();
    document.getElementById("start-puzzle-button").innerText = "Resume Puzzle";

    timer = setInterval(() => {
        if (!isPaused) {
            const timeLeft = endingTime - Date.now();

            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById("timer").innerHTML = "0" + minutes + ":" + String(seconds).padStart(2, "0");

            if (timeLeft < 0) {
                clearInterval(timer);
                document.getElementById("timer").innerHTML = "00:00";
                document.querySelector(".overlay").classList.remove("hide");
            }
        }
    }, 100);

    document.getElementById("start-puzzle-button").addEventListener("click", resumeCountdown);
    document.getElementById("start-puzzle-button").removeEventListener("click", startPuzzle);
    document.querySelector(".cover").classList.add("hide");

    document.getElementById("pause-countdown").addEventListener("click", pauseCountdown);

    function pauseCountdown() {
        isPaused = true;
        pausedTime = Date.now();

        document.querySelector(".cover").classList.remove("hide");
        document.getElementById("pause-countdown").innerHTML = "<i class='fas fa-play fa-lg'>"

        document.getElementById("pause-countdown").removeEventListener("click", pauseCountdown);
        document.getElementById("pause-countdown").addEventListener("click", resumeCountdown);
        
    }

    function resumeCountdown() {
        isPaused = false;
        let resumeTime = Date.now();
        totalPausedDuration += resumeTime - pausedTime;
        console.log("Total paused duration = " + totalPausedDuration);
        endingTime += resumeTime - pausedTime;

        document.querySelector(".cover").classList.add("hide");
        document.getElementById("pause-countdown").innerHTML = "<i class='fas fa-pause fa-lg'>"

        document.getElementById("pause-countdown").removeEventListener("click", resumeCountdown);
        document.getElementById("pause-countdown").addEventListener("click", pauseCountdown);
    }
}

//* NEW
function refreshDraggables() {
    draggables = document.querySelectorAll(".draggable");

    //? Check if the entire puzzle is solved. If not, refresh the draggables
    if (draggables === [] || draggables.length == 0) {
        calculateScore();
        document.getElementById("congratulations-overlay").classList.remove("hide");
        document.querySelectorAll(".dropzone").forEach(element => {
            element.classList.add("puzzle-solved");
        });
    } else {
        draggables.forEach(draggable => {
            makeDraggable(draggable);
        });
    }
}

function calculateScore() {
    clearInterval(timer);
    const score = Date.now() - startTime - totalPausedDuration;
    document.getElementById("score").innerText = score;
    document.getElementById("form-score").setAttribute("value", score);
}

function makeDraggable(draggable) {

    draggable.ondragstart = function() {
        return false;
    }

    draggable.addEventListener("mousedown", mouseDown);
    draggable.addEventListener("touchstart", touchStart);


    function touchStart(e) {
        //? OPTIONAL ANIMATIONS
        draggable.style.transitionProperty = "background-color";
        draggable.style.transitionDuration = "500ms";
        
        zIndex+=1;
        draggable.style.zIndex = zIndex;
        
        draggable.classList.add("draggable-active");

        originalX = draggable.getBoundingClientRect().left;
        originalY = draggable.getBoundingClientRect().top;
    
        shiftX = e.targetTouches[0].clientX - originalX;
        shiftY = e.targetTouches[0].clientY - originalY;
        
        document.addEventListener("touchmove", touchMove);
        draggable.addEventListener("touchend", mouseUp);
    }

    function touchMove(e) {

        draggable.style.left = e.targetTouches[0].clientX - shiftX - originalX + "px";
        draggable.style.top = e.targetTouches[0].clientY - shiftY - originalY + "px";

        draggable.hidden = true;
        let elemBelow = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);  // get the element at that point
        draggable.hidden = false;

        let droppableBelow = elemBelow.closest(".droppable");   // get the closest element that has the the class 'droppable'
    
        if (currentDroppable) {
            currentDroppable.classList.remove("droppable-hovered");
        }
    
        currentDroppable = droppableBelow;
    
        if (currentDroppable) {
            currentDroppable.classList.add("droppable-hovered");
        }
    }
    

    function mouseDown(e) {
        //? OPTIONAL ANIMATIONS
        draggable.style.transitionProperty = "background-color";
        draggable.style.transitionDuration = "500ms";
    
        zIndex+=1;
        draggable.style.zIndex = zIndex;
    
        draggable.classList.add("draggable-active");
    
        originalX = draggable.getBoundingClientRect().left;
        originalY = draggable.getBoundingClientRect().top;
    
        shiftX = e.clientX - originalX;
        shiftY = e.clientY - originalY;
    
        document.addEventListener("mousemove", mouseMove);
        draggable.addEventListener("mouseup", mouseUp);
    }
    
    function mouseMove(e) {
        draggable.style.left = e.clientX - shiftX - originalX + "px";
        draggable.style.top = e.clientY - shiftY - originalY + "px";
    
        draggable.hidden = true;
        let elemBelow = document.elementFromPoint(e.clientX, e.clientY);  // get the element at that point
        draggable.hidden = false;
        
        let droppableBelow = elemBelow.closest(".droppable");   // get the closest element that has the the class 'droppable'
    
        if (currentDroppable) {
            currentDroppable.classList.remove("droppable-hovered");
        }
    
        currentDroppable = droppableBelow;
    
        if (currentDroppable) {
            currentDroppable.classList.add("droppable-hovered");
        }
    }
    
    function mouseUp(e) {
        let append = true;
        draggable.classList.remove("draggable-active");

        //? OPTIONAL TRANSITION EFFECTS
        draggable.style.transitionProperty = "left, top";
        draggable.style.transitionDuration = "0.4s";

        draggable.style.left = 0;
        draggable.style.top = 0;

        if (currentDroppable) {
            if (currentDroppable.childElementCount > 0) {
                if (this.parentElement.classList[0] !== "puzzle-piece-box") {
                    
                    this.parentElement.append(currentDroppable.firstElementChild);      //? enable swapping
                    
                    //* NEW - check if the swapped puzzle piece is in the correct position
                    if (this.parentElement.lastElementChild.classList[0] === this.parentElement.classList[0]) {
                        this.parentElement.lastElementChild.classList.remove("draggable");
                        this.parentElement.classList.remove("droppable");
                    }

                } else {
                    append = false;
                }
            }

            if (append) {
                currentDroppable.append(draggable);
            }
            
            currentDroppable.classList.remove("droppable-hovered");
            
            //* to verify the correct piece and make it unusable
            if (currentDroppable.classList[0] === this.classList[0] && append) {
                currentDroppable.classList.remove("droppable");
                this.classList.remove("draggable");             //* NEW
            }
            //* NEW
            checkPuzzle(); //? Checks if the puzzle is complete
        }
    
        draggable.removeEventListener("mouseup", mouseUp);      //* Still needed if draggable didn't drop on a droppable
        document.removeEventListener("mousemove", mouseMove);
        draggable.removeEventListener("touchend", mouseUp);
        document.removeEventListener("touchmove", touchMove);
        currentDroppable = null;
    }

    //* NEW -> to remove all event listeners and allow the swap verification to work
    function checkPuzzle() {
        draggables.forEach(draggable => {
            let old_element = draggable;
            let new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);
        });
        refreshDraggables();
    }
}
