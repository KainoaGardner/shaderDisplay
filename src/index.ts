var shaderIndex = 0

const shaders = [
  "clock",
  "waldo",
  "sierpinskiCarpet",
  "alternatingBoxGrid",
  "colorPicker",
  "unscreenshotable",
  "motionExtraction"
]

const shaderFrame = document.getElementById("shaderFrame") as HTMLIFrameElement
const uiFrame = document.getElementById("uiFrame") as HTMLIFrameElement

const nextArrow = document.getElementById("nextArrow") as HTMLElement;
const prevArrow = document.getElementById("prevArrow") as HTMLElement;

prevArrow.addEventListener("click", function() {
  shaderIndex--;
  if (shaderIndex < 0) {
    shaderIndex = shaders.length - 1;
  }

  setIFrames()
});

nextArrow.addEventListener("click", function() {
  shaderIndex++;
  if (shaderIndex >= shaders.length) {
    shaderIndex = 0;
  }

  setIFrames()
});




function setIFrames() {
  shaderFrame.src = `/shaders/${shaders[shaderIndex]}/index.html#canvas`
  uiFrame.src = `/shaders/${shaders[shaderIndex]}/index.html#ui`
}
