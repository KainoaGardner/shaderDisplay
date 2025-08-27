import { Shader, createScreenFrameBuffer } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"


function sendSliderToCanvas(value: string) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "SLIDER", value: value }, "*")
    } catch (e) {

    }
  }
}

function sendPixelAmountToUI(value: string) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "PIXEL_AMOUNT", value: value }, "*")
    } catch (e) {

    }
  }
}

function main() {
  if (location.hash === "#ui") {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.error("cant find canvas");
      return
    }
    canvas.style.display = "none"
    mainUI()

  } else {
    const ui = document.getElementById("ui") as HTMLDivElement;
    if (!ui) {
      console.error("cant find ui");
      return
    }
    ui.style.display = "none"

    setup();
  }
}


const k = 0.0167115

let startTime = performance.now();
function mainCanvas() {
  let pixelAmount = 8;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "SLIDER") {
      let x = parseInt(event.data.value)
      pixelAmount = Math.floor(Math.exp(k * x) + 0.5)
      sendPixelAmountToUI(pixelAmount.toString())
    }
  })

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("cant find canvas");
    return
  }

  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }


  const gl = canvas.getContext("webgl2")
  if (!gl) {
    console.error("could not get webgl context")
    return;
  }

  const shader = new Shader(gl, vertexSource, fragmentSource)
  if (!shader.valid) {
    console.error("could not make shader")
    return;
  }


  const aPositionAttribute = gl.getAttribLocation(shader.program, "aPosition");
  if (aPositionAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }

  const aTextureAttribute = gl.getAttribLocation(shader.program, "aTexCoord");
  if (aTextureAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }


  const vao = Geometry.createPosTexGeometry(gl,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    Geometry.SQUARE_INDICES.length / 3,
    aPositionAttribute,
    Geometry.TEXTURE_VERTICES,
    Geometry.TEXTURE_INDICES,
    Geometry.TEXTURE_INDICES.length / 3,
    aTextureAttribute
  );

  if (!vao) {
    console.error("could not make vao")
    return null
  }

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0])


  loading.style.display = "none"

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  const frame = function() {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.useProgram(shader.program)
    shader.set1i(gl, "uImage", 0)
    shader.set1f(gl, "uPixelAmount", pixelAmount)
    shader.set2f(gl, "uResolution", canvas.width, canvas.height)

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function mainUI() {
  const slider = document.getElementById("slider") as HTMLInputElement;
  slider.addEventListener("input", function(event) {
    sendSliderToCanvas(this.value)
  });

  const pixelAmountElement = document.getElementById("pixelAmount") as HTMLElement;
  if (!pixelAmountElement) {
    console.error("cant find pixelamount element");
    return
  }

  window.addEventListener("message", (event) => {
    if (event.data?.type === "PIXEL_AMOUNT") {
      const pixelAmount = event.data.value
      pixelAmountElement.textContent = pixelAmount + "x" + pixelAmount
    }
  })

  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }

  loading.style.display = "none"

}



const images: HTMLImageElement[] = [];
function setup() {
  loadImage("../../assets/pixelize/girlWithPearl.jpg")
}

function checkImagesLoaded(): boolean {
  if (images.length === 1) {
    return true
  }
  return false
}

function loadImage(source: string) {
  const image = new Image();
  if (!image) {
    console.error("Could not load image")
    return
  }

  image.src = source
  image.onload = function() {
    images.push(image);
    if (checkImagesLoaded()) {
      mainCanvas()
    }
  }
}


main()
