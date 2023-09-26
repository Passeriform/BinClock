// TODO: On entire section clear, grow and shrink in a wave pattern

/** UTILITIES **/
const MAX_HOUR_BIT_BLOCKS = Math.ceil(Math.log2(24))
const MAX_MINUTE_OR_SECOND_BIT_BLOCKS = Math.ceil(Math.log2(60))
const MAX_SUB_SECOND_BIT_BLOCKS = Math.ceil(Math.log2(1000))

const getMaxBitBlocks = (idx) => {

    switch (idx) {
        // Hours
        case 0: return MAX_HOUR_BIT_BLOCKS
        // Minutes
        case 1: return MAX_MINUTE_OR_SECOND_BIT_BLOCKS
        // Seconds
        case 2: return MAX_MINUTE_OR_SECOND_BIT_BLOCKS
        // Miliseconds and below
        case 3:
        case 4:
            return MAX_SUB_SECOND_BIT_BLOCKS
    }
}

const getTimeUnit = (time, idx) => {
    switch (idx) {
        // Hours
        case 0: return time.getHours()
        // Minutes
        case 1: return time.getMinutes()
        // Seconds
        case 2: return time.getSeconds()
        // Miliseconds and below
        case 3: return time.getMilliseconds()
        // HACK: Using browser performance timer which will mismatch with global timer, but still usable
        case 4: return performance.now() % 1000
    }
}

const getSetBits = (input) => {
    let count = 0;
    for (; input > 0; input &= (input - 1)) {
        count++
    }
    return count;
}
/** --------- **/


/** HEAP **/
let containers = []
let ticks = 0
const highlighters = []
const tickSkip = 1
let resolutionUnits = 3
/** ---- **/


/** BOOTSTRAPPING **/
const prepareClock = (container, idx) => {
    const maxElements = getMaxBitBlocks(idx)
    Array.from(Array(maxElements)).forEach(_ => {
        const bitElement = document.createElement("div")
        bitElement.className = "bit-block"
        container.appendChild(bitElement)
    })
}
/** ------------- **/

/** TICK **/
const createHighlighter = () => {
    const highlighterElement = document.createElement("div")
    highlighterElement.className = "highlighter"
    return highlighterElement
}

const createHighlighters = (displayValue, container, idx) => {
    const factoryContainerBoundingRectangle = document.getElementById("highlighters-factory").getBoundingClientRect()
    const highlightersNeeded = getSetBits(displayValue)
    const trackingIndices = Array.from(displayValue.toString(2).padStart(getMaxBitBlocks(idx), "0")).reverse().reduce(
        (accumulator, current, currentIdx) => current === "1"
            ? [...accumulator, currentIdx]
            : accumulator
        , []
    )
    return Array.from(Array(highlightersNeeded)).map((_, highlighterIdx) => {
        const highlighterElement = createHighlighter()
        bitBlockBoundingRectangle = container.children[trackingIndices[highlighterIdx]]?.getBoundingClientRect()
        if (!bitBlockBoundingRectangle) {
            highlighterElement.style.display = "none"
            return highlighterElement
        }
        highlighterElement.style.left = bitBlockBoundingRectangle.x - factoryContainerBoundingRectangle.x + "px"
        highlighterElement.style.top = bitBlockBoundingRectangle.y - factoryContainerBoundingRectangle.y + "px"
        return highlighterElement
    })
}

const update = () => {
    const time = new Date()

    Array.from(document.getElementsByClassName("clock-section")).forEach((element, idx) => {
        element.style.display = (idx < resolutionUnits) ? "flex" : "none"
    });

    containers.forEach((container, idx) => {
        const displayValue = getTimeUnit(time, idx);
        highlighters[idx] = createHighlighters(displayValue, container, idx)
    })
}

const draw = () => {
    const factoryContainer = document.getElementById("highlighters-factory")
    while (factoryContainer.firstChild) {
        factoryContainer.removeChild(factoryContainer.lastChild);
    }

    containers.forEach((_, idx) => {
        highlighters[idx].forEach(highlighter => factoryContainer.appendChild(highlighter))
    })
} 

const tick = () => {
    if (ticks % tickSkip === 0) {
        update()
        draw()
    }
    ticks++
    requestAnimationFrame(tick)
}
/** ---- **/

window.onload = () => {
    containers = Array.from(document.getElementsByClassName("bits-container"))
    
    containers.forEach((container, idx) => {
        prepareClock(container, idx)
        highlighters[idx] = []
    })

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            resolutionUnits = ((resolutionUnits) % 5) + 1
        }
    })


    requestAnimationFrame(tick)
}
