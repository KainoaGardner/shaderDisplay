import { Shader, createScreenFrameBuffer } from "../../src/utils";
import { Geometry } from "../../src/geometry";
import gaussianBlurFragmentSource from "./gaussianBlur.frag?raw";
import screenFragmentSource from "./screenFragment.frag?raw";
import offFragmentSource from "./offFragment.frag?raw";
import vertexSource from "./vertex.vert?raw";
function sendToggleToCanvas() {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
        try {
            frames[i].postMessage({ type: "TOGGLE" }, "*");
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
        setup();
    }
}
let startTime = performance.now();
function mainCanvas() {
    let toggle = true;
    window.addEventListener("message", (event) => {
        if (event.data?.type === "TOGGLE") {
            toggle = !toggle;
        }
        console.log(toggle);
    });
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
    const blurShader = new Shader(gl, vertexSource, gaussianBlurFragmentSource);
    if (!blurShader.valid) {
        console.error("could not make shader");
        return;
    }
    const screenShader = new Shader(gl, vertexSource, screenFragmentSource);
    if (!screenShader.valid) {
        console.error("could not make shader");
        return;
    }
    const offShader = new Shader(gl, vertexSource, offFragmentSource);
    if (!offShader.valid) {
        console.error("could not make shader");
        return;
    }
    const aPositionAttribute = gl.getAttribLocation(blurShader.program, "aPosition");
    if (aPositionAttribute < 0) {
        console.error("Could not find attribuites");
        return null;
    }
    const aTextureAttribute = gl.getAttribLocation(blurShader.program, "aTexCoord");
    if (aTextureAttribute < 0) {
        console.error("Could not find attribuites");
        return null;
    }
    const vao = Geometry.createPosTexGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, Geometry.SQUARE_INDICES.length / 3, aPositionAttribute, Geometry.TEXTURE_VERTICES, Geometry.TEXTURE_INDICES, Geometry.TEXTURE_INDICES.length / 3, aTextureAttribute);
    if (!vao) {
        console.error("could not make vao");
        return null;
    }
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    const { screenFramebuffer, screenTexture } = createScreenFrameBuffer(gl, canvas.width, canvas.height);
    const frame = function () {
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        if (toggle) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(blurShader.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            blurShader.set1i(gl, "uImage", 0);
            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.5, 0.2, 0.2, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(screenShader.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, screenTexture);
            screenShader.set1i(gl, "uImage", 0);
            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
        }
        else {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0.2, 0.2, 0.2, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(offShader.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            offShader.set1i(gl, "uImage", 0);
            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
function mainUI() {
    const toggleButton = document.getElementById("toggle");
    toggleButton.addEventListener("click", function () {
        sendToggleToCanvas();
    });
}
const images = [];
function setup() {
    loadImage("../../assets/edgeDetection/pantheon.jpeg");
}
function checkImagesLoaded() {
    if (images.length === 1) {
        return true;
    }
    return false;
}
function loadImage(source) {
    const image = new Image();
    if (!image) {
        console.error("Could not load image");
        return;
    }
    image.src = source;
    image.onload = function () {
        images.push(image);
        if (checkImagesLoaded()) {
            mainCanvas();
        }
    };
}
main();
