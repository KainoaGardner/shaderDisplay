import { Shader, createScreenFrameBufferAlpha } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"
import screenFragmentSource from "./screen.frag?raw"
import screenVertexSource from "./screen.vert?raw"


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

    setup()
  }
}


let startTime = performance.now();

function mainCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("cant find canvas");
    return
  }

  window.addEventListener("resize",function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
  })


  const gl = canvas.getContext("webgl2",{alpha: true})
  if (!gl) {
    console.error("could not get webgl context")
    return;
  }

  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }


  const shader = new Shader(gl, vertexSource, fragmentSource)
  if (!shader.valid) {
    console.error("could not make shader")
    return;
  }

  const screenShader = new Shader(gl, screenVertexSource, screenFragmentSource)
  if (!screenShader.valid) {
    console.error("could not make shader")
    return;
  }

  const aPositionAttribute = gl.getAttribLocation(shader.program, "aPosition");
  if (aPositionAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }

  const vao = Geometry.createPosGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, Geometry.SQUARE_INDICES.length / 3, aPositionAttribute);
  if (!vao) {
    console.error("could not make vao")
    return null
  }

  const screenPositionAttribute = gl.getAttribLocation(screenShader.program, "aPosition");
  if (screenPositionAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }
  const screenTextureAttribute = gl.getAttribLocation(screenShader.program, "aTexCoord");
  if (screenTextureAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }

  const screenVao = Geometry.createPosTexGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, 2, screenPositionAttribute, Geometry.TEXTURE_VERTICES, Geometry.TEXTURE_INDICES, 2, screenTextureAttribute);
  if (!screenVao) {
    console.error("could not make vao")
    return null
  }

  const lavaLampTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, lavaLampTexture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]!)

  const lavaLampMaskTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, lavaLampMaskTexture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[1]!)

  loading.style.display = "none"

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  const textureWidth = 1000
  const textureHeight = 1000
  const { screenFramebuffer, screenTexture } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight)

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer)
    gl.viewport(0, 0, textureWidth, textureHeight)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shader.program)

    shader.set2f(gl, "uResolution", canvas.width, canvas.height)
    const currFrameTime = performance.now();
    const timePassed = (currFrameTime - startTime) / 1000;
    shader.set1f(gl, "uTime", timePassed)

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)


    gl.enable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(screenShader.program)

    screenShader.set2f(gl, "uResolution", canvas.width, canvas.height)
    screenShader.set2f(gl, "uTextureResolution", textureWidth,textureHeight)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, lavaLampTexture)
    screenShader.set1i(gl, "uFrame", 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, lavaLampMaskTexture)
    screenShader.set1i(gl, "uMask", 1)

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, screenTexture)
    screenShader.set1i(gl, "uSim", 2)


    gl.bindVertexArray(screenVao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)


    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function mainUI() {
  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }

  loading.style.display = "none"
}

const imagePaths: string[] = [
  "../../assets/lavaLamp/lavaLamp.png",
  "../../assets/lavaLamp/lavaLampMask.png",
]

const images: (HTMLImageElement | null)[]  = new Array(imagePaths.length).fill(null);
function setup() {
  for (let i = 0;i < imagePaths.length;i++){
    loadImage(imagePaths[i],i)
  }
}

function checkImagesLoaded(): boolean {
  for (let i = 0; i < images.length;i++){
    if (images[i] === null){
      return false
    }
  }

  return true
}

function loadImage(source: string,index: number) {
  const image = new Image();
  if (!image) {
    console.error("Could not load image")
    return
  }

  image.src = source
  image.onload = function() {
    images[index] = image
    if (checkImagesLoaded()) {
      mainCanvas()
    }
  }
}



main()


