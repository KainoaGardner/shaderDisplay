"use strict";
var shaderIndex = 14;
const shaders = [
    "clock",
    "waldo",
    "sierpinskiCarpet",
    "alternatingBoxGrid",
    "colorPicker",
    "unscreenshotable",
    "motionExtraction",
    "rayMarching0",
    "edgeDetection",
    "pixelize",
    "glitch",
    "lavaLamp",
    "gameOfLife",
    "mandelbrot",
    "droste",
];
const shaderFrame = document.getElementById("shaderFrame");
const uiFrame = document.getElementById("uiFrame");
const nextArrow = document.getElementById("nextArrow");
const prevArrow = document.getElementById("prevArrow");
prevArrow.addEventListener("click", function () {
    shaderIndex--;
    if (shaderIndex < 0) {
        shaderIndex = shaders.length - 1;
    }
    setIFrames();
});
nextArrow.addEventListener("click", function () {
    shaderIndex++;
    if (shaderIndex >= shaders.length) {
        shaderIndex = 0;
    }
    setIFrames();
});
function setIFrames() {
    shaderFrame.src = `/shaders/${shaders[shaderIndex]}/index.html#canvas`;
    uiFrame.src = `/shaders/${shaders[shaderIndex]}/index.html#ui`;
}
setIFrames();
