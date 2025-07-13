import { Shader } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"
import offFragmentSource from "./offFragment.frag?raw"


const totalFrames = 75;
const frameOffset = 3;


function sendToggleToCanvas() {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "TOGGLE" }, "*")
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

    intervalFrame = setInterval(updateFrame, 1000 / 24)
  }
}


let startTime = performance.now();
function mainCanvas() {

  let toggle = true;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "TOGGLE") {
      toggle = !toggle
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

  const offShader = new Shader(gl, vertexSource, offFragmentSource)
  if (!offShader.valid) {
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


  gl.useProgram(shader.program)
  const textures = createTextures(gl, images)
  loading.style.display = "none"

  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (toggle) {
      gl.useProgram(shader.program)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[frameIndex])
      shader.set1i(gl, "uImage", 0)

      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, textures[(frameIndex + frameOffset) % textures.length])
      shader.set1i(gl, "uNextImage", 1)
    } else {
      gl.useProgram(offShader.program)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[frameIndex])
      shader.set1i(gl, "uImage", 0)
    }

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}



let intervalFrame: number | null = null;
let frameIndex = 0

function updateFrame(): void {
  frameIndex += 1
  if (frameIndex >= totalFrames) {
    frameIndex = 0
  }
}




function mainUI() {
  const toggleButton = document.getElementById("toggle") as HTMLElement;
  toggleButton.addEventListener("click", function() {
    sendToggleToCanvas()
  });


  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }

  loading.style.display = "none"
}


function createTextures(gl: WebGL2RenderingContext, images: HTMLImageElement[]) {
  const textures: WebGLTexture[] = [];
  for (let i = 0; i < images.length; i++) {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[i])
    textures.push(texture)
  }

  return textures
}


function setup() {
  for (let i = 1; i <= totalFrames + 1; i++) {
    loadImage(`../../assets/rainImages/frame_${i}.jpg`, i - 1)
  }
}


const images: HTMLImageElement[] = new Array(totalFrames);
let finishedFrame = 0;
function checkImagesLoaded(): boolean {
  if (finishedFrame === totalFrames) {
    return true
  }
  return false
}

function loadImage(source: string, index: number) {
  const image = new Image();
  if (!image) {
    console.error("Could not load image")
    return
  }

  image.src = source
  image.onload = function() {
    images[index] = image
    finishedFrame++
    if (checkImagesLoaded()) {
      if (!checkValidImages()) {
        finishedFrame = 0
        setup()
      } else {
        mainCanvas()
      }
    }
  }
}

function checkValidImages() {
  for (let i = 0; i < images.length; i++) {
    if (images[i] === undefined) {
      return false
    }
  }
  return true
}


main()
