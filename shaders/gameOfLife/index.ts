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

    mainCanvas()
  }
}

function mainCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("cant find canvas");
    return
  }

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

  loading.style.display = "none"

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  const textureWidth = 50
  const textureHeight = 50

  const spawnPercent = 0.1;
  const startData = createInitialData(spawnPercent,textureWidth,textureHeight)
  const { screenFramebuffer: fbA, screenTexture: texA } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight,startData)
  const { screenFramebuffer: fbB, screenTexture: texB } = createScreenFrameBufferAlpha(gl, textureWidth, textureHeight)

  let lastTexture = texA;
  let lastFB = fbA;
  let currTexture = texB;
  let currFB = fbB;

  let lastFrameTime = performance.now()
  const FPS = 10;
  const timePerFrame = 1.0 / FPS

  let currFrameTimeAmount = 0;

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    const currFrameTime = performance.now()
    const dt = (currFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currFrameTime
    currFrameTimeAmount += dt

    if (currFrameTimeAmount > timePerFrame){
      currFrameTimeAmount = currFrameTimeAmount % timePerFrame

      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, currFB)
      gl.viewport(0, 0, textureWidth, textureHeight)
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shader.program)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, lastTexture)
      shader.set1i(gl, "uImage", 0)
      shader.set2f(gl, "uResolution", textureWidth,textureHeight)

      gl.bindVertexArray(vao)
      gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null)
      
      const tempTexture = currTexture
      currTexture = lastTexture
      lastTexture = tempTexture

      const tempFB = currFB
      currFB = lastFB
      lastFB = tempFB
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.enable(gl.BLEND);

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(screenShader.program)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, currTexture)

    screenShader.set3f(gl, "uCellColor", 1.0,0.0,0.0)
    screenShader.set1i(gl, "uImage", 0)

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

function createInitialData(spawnPercent: number,width:number, height:number) {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i+= 4) {
    data[i] = 0
    data[i + 1] = 0
    data[i + 2] = 0
    data[i + 3] = Math.random() < spawnPercent ? 255 : 0; 
  }
  return data;
}

main()

