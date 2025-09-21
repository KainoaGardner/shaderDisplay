import { Shader, createScreenFrameBufferAlpha } from "../../src/utils";
import { Geometry } from "../../src/geometry";
import fragmentSource from "./fragment.frag?raw";
import vertexSource from "./vertex.vert?raw";
import screenFragmentSource from "./screen.frag?raw";
import screenVertexSource from "./screen.vert?raw";
class Setup {
    width = 0;
    height = 0;
    grid = [];
    cellWidth = 0;
    cellHeight = 0;
    canvas;
    ctx;
    cellColor = "#FFFFFF";
    constructor(canvas, ctx, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.updateSize(width, height);
    }
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.cellWidth = this.canvas.width / this.width;
        this.cellHeight = this.canvas.height / this.height;
        this.grid = Array.from({ length: height }, () => Array(width).fill(false));
    }
    clearGrid() {
        this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(false));
    }
    toggleCell(mouse) {
        const xCell = Math.floor(mouse.x / this.cellWidth);
        const yCell = Math.floor(mouse.y / this.cellHeight);
        if (0 <= xCell && xCell < this.grid[0].length && 0 <= yCell && yCell < this.grid.length) {
            if (mouse.pressed[0]) {
                this.grid[yCell][xCell] = true;
            }
            else if (mouse.pressed[2]) {
                this.grid[yCell][xCell] = false;
            }
        }
    }
    draw() {
        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.#drawCells();
        this.#drawGrid();
    }
    #drawGrid() {
        this.ctx.strokeStyle = "#999";
        this.ctx.lineWidth = this.cellWidth / 20;
        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < this.height + 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellHeight);
            this.ctx.lineTo(this.canvas.width, i * this.cellHeight);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.width + 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellWidth, 0);
            this.ctx.lineTo(i * this.cellWidth, this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1.0;
    }
    #drawCells() {
        this.ctx.fillStyle = this.cellColor;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.grid[i][j]) {
                    this.ctx.fillRect(j * this.cellWidth, i * this.cellHeight, this.cellWidth, this.cellHeight);
                }
            }
        }
    }
    createRandomGrid(spawnPercent) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (Math.random() <= spawnPercent) {
                    this.grid[i][j] = true;
                }
                else {
                    this.grid[i][j] = false;
                }
            }
        }
    }
    convertGridToTexData() {
        const data = new Uint8Array(this.width * this.height * 4);
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const i = ((this.height - r - 1) * this.width + c) * 4;
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = this.grid[r][c] ? 255 : 0;
            }
        }
        return data;
    }
}
function UIInputs() {
    const setupUIDiv = document.getElementById("setup");
    const simulationUIDiv = document.getElementById("simulation");
    simulationUIDiv.style.display = "none";
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", function () {
        sendStartToCanvas();
        simulationUIDiv.style.display = "block";
        setupUIDiv.style.display = "none";
    });
    const stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", function () {
        sendStartToCanvas();
        simulationUIDiv.style.display = "none";
        setupUIDiv.style.display = "block";
    });
    const clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", function () {
        sendClearToCanvas();
    });
    const randomButton = document.getElementById("random");
    randomButton.addEventListener("click", function () {
        sendRandomToCanvas();
    });
    const colorSelector = document.getElementById("color");
    const colorSimSelector = document.getElementById("colorSim");
    colorSelector.addEventListener("change", function (event) {
        const input = event.target;
        const color = input.value;
        colorSimSelector.value = color;
        sendColorToCanvas(color);
    });
    colorSimSelector.addEventListener("change", function (event) {
        const input = event.target;
        const color = input.value;
        colorSelector.value = color;
        sendColorToCanvas(color);
    });
    const sizeInput = document.getElementById("size");
    sizeInput.addEventListener("change", function (event) {
        const input = event.target;
        let size = parseInt(input.value);
        if (size <= 0) {
            input.value = "1";
            size = 1;
        }
        else if (size > 100) {
            input.value = "100";
            size = 100;
        }
        sendSizeToCanvas(size);
    });
    const fpsElement = document.getElementById("fps");
    if (!fpsElement) {
        console.error("cant find fps element");
        return;
    }
    const fpsInput = document.getElementById("slider");
    fpsInput.addEventListener("input", function (event) {
        const input = event.target;
        let fps = parseInt(input.value);
        fpsElement.textContent = fps + " FPS";
        sendFPSToCanvas(fps);
    });
}
function main() {
    if (location.hash === "#ui") {
        const canvas = document.getElementById("canvas");
        if (!canvas) {
            console.error("cant find canvas");
            return;
        }
        canvas.style.display = "none";
        const canvas2d = document.getElementById("canvas2d");
        if (!canvas2d) {
            console.error("cant find canvas 2d");
            return;
        }
        canvas2d.style.display = "none";
        mainUI();
    }
    else {
        const ui = document.getElementById("ui");
        if (!ui) {
            console.error("cant find ui");
            return;
        }
        ui.style.display = "none";
        mainCanvas();
    }
}
function mainCanvas() {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("cant find canvas");
        return;
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("could not get webgl context");
        return;
    }
    const canvas2d = document.getElementById("canvas2d");
    if (!canvas) {
        console.error("cant find canvas");
        return;
    }
    canvas.style.display = "none";
    const ctx = canvas2d.getContext("2d");
    if (!ctx) {
        console.error("could not get ctx");
        return;
    }
    const loading = document.getElementById("loading");
    if (!loading) {
        console.error("cant find canvas");
        return;
    }
    const shader = new Shader(gl, vertexSource, fragmentSource);
    if (!shader.valid) {
        console.error("could not make shader");
        return;
    }
    const screenShader = new Shader(gl, screenVertexSource, screenFragmentSource);
    if (!screenShader.valid) {
        console.error("could not make shader");
        return;
    }
    const aPositionAttribute = gl.getAttribLocation(shader.program, "aPosition");
    if (aPositionAttribute < 0) {
        console.error("Could not find attribuites");
        return null;
    }
    const vao = Geometry.createPosGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, Geometry.SQUARE_INDICES.length / 3, aPositionAttribute);
    if (!vao) {
        console.error("could not make vao");
        return null;
    }
    const screenPositionAttribute = gl.getAttribLocation(screenShader.program, "aPosition");
    if (screenPositionAttribute < 0) {
        console.error("Could not find attribuites");
        return null;
    }
    const screenTextureAttribute = gl.getAttribLocation(screenShader.program, "aTexCoord");
    if (screenTextureAttribute < 0) {
        console.error("Could not find attribuites");
        return null;
    }
    const screenVao = Geometry.createPosTexGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, 2, screenPositionAttribute, Geometry.TEXTURE_VERTICES, Geometry.TEXTURE_INDICES, 2, screenTextureAttribute);
    if (!screenVao) {
        console.error("could not make vao");
        return null;
    }
    canvas2d.height = canvas2d.clientHeight;
    canvas2d.width = canvas2d.clientWidth;
    const mouse = {
        x: 0,
        y: 0,
        pressed: [false, false, false],
    };
    document.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });
    document.addEventListener("mousedown", function (event) {
        if (event.button <= 2) {
            mouse.pressed[event.button] = true;
        }
    });
    document.addEventListener("mouseup", function (event) {
        if (event.button <= 2) {
            mouse.pressed[event.button] = false;
        }
    });
    document.addEventListener("mousemove", function (event) {
        const rect0 = canvas2d.getBoundingClientRect();
        const mousePosX0 = event.clientX - rect0.left;
        const mousePosY0 = event.clientY - rect0.top;
        if (mouse.pressed) {
            mouse.x = mousePosX0;
            mouse.y = mousePosY0;
        }
    });
    loading.style.display = "none";
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    let textureWidth = 10;
    let textureHeight = 10;
    const spawnPercent = 0.25;
    const { screenFramebuffer: fbA, screenTexture: texA } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight);
    const { screenFramebuffer: fbB, screenTexture: texB } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight);
    let lastTexture = texA;
    let lastFB = fbA;
    let currTexture = texB;
    let currFB = fbB;
    let lastFrameTime = performance.now();
    let FPS = 5;
    let timePerFrame = 1.0 / FPS;
    let currFrameTimeAmount = 0;
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const setup = new Setup(canvas2d, ctx, textureWidth, textureHeight);
    window.addEventListener("resize", function () {
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        canvas2d.height = canvas2d.clientHeight;
        canvas2d.width = canvas2d.clientWidth;
        setup.cellWidth = setup.canvas.width / setup.width;
        setup.cellHeight = setup.canvas.height / setup.height;
    });
    let screen = "setup";
    let cellColor = HexToRGB(setup.cellColor);
    window.addEventListener("message", (event) => {
        if (event.data?.type === "START/STOP") {
            if (screen === "setup") {
                screen = "simulation";
                canvas2d.style.display = "none";
                canvas.style.display = "block";
                textureWidth = setup.width;
                textureHeight = setup.height;
                const data = setup.convertGridToTexData();
                const { screenFramebuffer: fbA, screenTexture: texA } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight, data);
                const { screenFramebuffer: fbB, screenTexture: texB } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight);
                lastTexture = texA;
                lastFB = fbA;
                currTexture = texB;
                currFB = fbB;
            }
            else {
                screen = "setup";
                canvas2d.style.display = "block";
                canvas.style.display = "none";
            }
        }
        if (event.data?.type === "CLEAR") {
            setup.clearGrid();
        }
        if (event.data?.type === "RANDOM") {
            setup.createRandomGrid(spawnPercent);
        }
        if (event.data?.type === "COLOR") {
            const color = event.data.value;
            setup.cellColor = color;
            cellColor = HexToRGB(color);
        }
        if (event.data?.type === "SIZE") {
            const size = event.data.value;
            setup.updateSize(size, size);
        }
        if (event.data?.type === "FPS") {
            const fps = event.data.value;
            FPS = fps;
            timePerFrame = 1.0 / FPS;
        }
    });
    const frame = function () {
        switch (screen) {
            case "setup": {
                setup.toggleCell(mouse);
                setup.draw();
                break;
            }
            case "simulation": {
                canvas.height = canvas.clientHeight;
                canvas.width = canvas.clientWidth;
                const currFrameTime = performance.now();
                const dt = (currFrameTime - lastFrameTime) / 1000;
                lastFrameTime = currFrameTime;
                currFrameTimeAmount += dt;
                if (currFrameTimeAmount > timePerFrame) {
                    currFrameTimeAmount = currFrameTimeAmount % timePerFrame;
                    gl.disable(gl.BLEND);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, currFB);
                    gl.viewport(0, 0, textureWidth, textureHeight);
                    gl.clearColor(0.0, 0.0, 0.0, 0.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.useProgram(shader.program);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, lastTexture);
                    shader.set1i(gl, "uImage", 0);
                    shader.set2f(gl, "uResolution", textureWidth, textureHeight);
                    gl.bindVertexArray(vao);
                    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
                    gl.bindVertexArray(null);
                    const tempTexture = currTexture;
                    currTexture = lastTexture;
                    lastTexture = tempTexture;
                    const tempFB = currFB;
                    currFB = lastFB;
                    lastFB = tempFB;
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.enable(gl.BLEND);
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.clearColor(0.0, 0.0, 0.0, 0.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(screenShader.program);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, currTexture);
                screenShader.set3f(gl, "uCellColor", cellColor[0], cellColor[1], cellColor[2]);
                screenShader.set1i(gl, "uImage", 0);
                gl.bindVertexArray(screenVao);
                gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
                gl.bindVertexArray(null);
                break;
            }
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
function mainUI() {
    UIInputs();
    const loading = document.getElementById("loading");
    if (!loading) {
        console.error("cant find canvas");
        return;
    }
    loading.style.display = "none";
}
function sendStartToCanvas() {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "START/STOP" }, "*");
        }
        catch (e) {
        }
    }
}
function sendRandomToCanvas() {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "RANDOM" }, "*");
        }
        catch (e) {
        }
    }
}
function sendClearToCanvas() {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "CLEAR" }, "*");
        }
        catch (e) {
        }
    }
}
function sendColorToCanvas(color) {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "COLOR", value: color }, "*");
        }
        catch (e) {
        }
    }
}
function sendSizeToCanvas(size) {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "SIZE", value: size }, "*");
        }
        catch (e) {
        }
    }
}
function sendFPSToCanvas(fps) {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "FPS", value: fps }, "*");
        }
        catch (e) {
        }
    }
}
function HexToRGB(hex) {
    let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    if (cleanHex.length === 3) {
        cleanHex = cleanHex[0] + cleanHex[0] +
            cleanHex[1] + cleanHex[1] +
            cleanHex[2] + cleanHex[2];
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return [r, g, b];
}
main();
