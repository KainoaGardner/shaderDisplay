import { Shader } from "../../src/utils";
import { Geometry } from "../../src/geometry";
import fragmentSource from "./fragment.frag?raw";
import vertexSource from "./vertex.vert?raw";
function sendResetToCanvas() {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "RESET" }, "*");
        }
        catch (e) {
        }
    }
}
function main() {
    if (location.hash === "#ui") {
        const canvas = document.getElementById("canvas");
        if (!canvas) {
            console.error("cant find canvas");
            return;
        }
        canvas.style.display = "none";
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
const keys = new Map();
keys.set("left", false);
keys.set("right", false);
keys.set("up", false);
keys.set("down", false);
keys.set("zoomIn", false);
keys.set("zoomOut", false);
function mainCanvas() {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("cant find canvas");
        return;
    }
    document.addEventListener("keydown", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            keys.set("up", true);
        }
        if (event.key === "s" || event.key === "ArrowDown") {
            keys.set("down", true);
        }
        if (event.key === "a" || event.key === "ArrowLeft") {
            keys.set("left", true);
        }
        if (event.key === "d" || event.key === "ArrowRight") {
            keys.set("right", true);
        }
        if (event.key === "q" || event.key === "-") {
            keys.set("zoomOut", true);
        }
        if (event.key === "e" || event.key === "+") {
            keys.set("zoomIn", true);
        }
    });
    document.addEventListener("keyup", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            keys.set("up", false);
        }
        if (event.key === "s" || event.key === "ArrowDown") {
            keys.set("down", false);
        }
        if (event.key === "a" || event.key === "ArrowLeft") {
            keys.set("left", false);
        }
        if (event.key === "d" || event.key === "ArrowRight") {
            keys.set("right", false);
        }
        if (event.key === "q" || event.key === "-") {
            keys.set("zoomOut", false);
        }
        if (event.key === "e" || event.key === "+") {
            keys.set("zoomIn", false);
        }
    });
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("could not get webgl context");
        return;
    }
    const shader = new Shader(gl, vertexSource, fragmentSource);
    if (!shader.valid) {
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
    let zoom = 1.0;
    let movePosX = 0.0;
    let movePosY = 0.0;
    let lastFrameTime = performance.now();
    let FPS = 60;
    let timePerFrame = 1.0 / FPS;
    let currFrameTimeAmount = 0;
    window.addEventListener("message", (event) => {
        if (event.data?.type === "RESET") {
            zoom = 1.0;
            movePosX = 0.0;
            movePosY = 0.0;
        }
    });
    const frame = function () {
        const currFrameTime = performance.now();
        const dt = (currFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currFrameTime;
        currFrameTimeAmount += dt;
        if (currFrameTimeAmount > timePerFrame) {
            currFrameTimeAmount = currFrameTimeAmount % timePerFrame;
            const speed = 0.01 * zoom;
            if (keys.get("up")) {
                movePosY += speed;
            }
            if (keys.get("down")) {
                movePosY -= speed;
            }
            if (keys.get("left")) {
                movePosX -= speed;
            }
            if (keys.get("right")) {
                movePosX += speed;
            }
            if (keys.get("zoomIn")) {
                zoom -= speed;
            }
            if (keys.get("zoomOut")) {
                zoom += speed;
            }
        }
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(shader.program);
        shader.set2f(gl, "uResolution", canvas.width, canvas.height);
        shader.set2f(gl, "uMove", movePosX, movePosY);
        shader.set1f(gl, "uZoom", zoom);
        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
function mainUI() {
    const toggleButton = document.getElementById("reset");
    toggleButton.addEventListener("click", function () {
        sendResetToCanvas();
    });
}
main();
