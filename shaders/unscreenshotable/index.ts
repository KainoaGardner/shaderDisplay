import { Shader, createScreenFrameBuffer } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"
import screenFragmentSource from "./screenFragment.frag?raw"
import screenVertexSource from "./screenVertex.vert?raw"


import { mat4, vec3, vec2 } from "gl-matrix"



function sendPauseToCanvas() {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "TOGGLE_PAUSE" }, "*")
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

    const pauseButton = document.getElementById("pause") as HTMLElement;
    pauseButton.addEventListener("click", function() {
      sendPauseToCanvas()
    });


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



let startTime = performance.now();
function mainCanvas() {
  let pause = false;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "TOGGLE_PAUSE") {
      pause = !pause
    }
  })

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
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

  const vao = Geometry.createPosGeometry(gl, Geometry.CUBE_VERTICES, Geometry.CUBE_INDICES, 3, aPositionAttribute);
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

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  const textureWidth = 100
  const textureHeight = 100
  const { screenFramebuffer, screenTexture } = createScreenFrameBuffer(gl, textureWidth, textureHeight)


  const boxTranslation = vec3.fromValues(0.0, 0.0, -3.0);
  const boxScale = vec3.fromValues(1.0, 1.0, 1.0);

  let xDir = 1
  let yDir = 1
  if (Math.random() < 0.5)
    xDir *= -1
  if (Math.random() < 0.5)
    yDir *= -1
  const boxVelocity = vec3.fromValues(1.0 * xDir, 1.0 * yDir, 0.0)


  const fov = Math.PI / 4;
  const aspect = canvas.width / canvas.height;
  const near = 1.0;
  const far = 10.0;
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, fov, aspect, near, far);

  let lastFrameTime = performance.now()
  let angle = 0;
  const frame = function() {
    gl.enable(gl.DEPTH_TEST);
    const currFrameTime = performance.now()
    const dt = (currFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currFrameTime

    if (!pause)
      angle += dt

    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer)
    gl.viewport(0, 0, textureWidth, textureHeight)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shader.program)

    const modelMatrix = mat4.create()
    mat4.translate(modelMatrix, modelMatrix, boxTranslation)
    mat4.rotate(modelMatrix, modelMatrix, angle, [0, 1, 0])
    mat4.rotate(modelMatrix, modelMatrix, angle, [1, 0, 0])
    mat4.scale(modelMatrix, modelMatrix, boxScale)

    shader.setMat4fv(gl, "uModel", modelMatrix)
    shader.setMat4fv(gl, "uProjection", projectionMatrix)

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.CUBE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(screenShader.program)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, screenTexture)
    screenShader.set1i(gl, "uImage", 0)

    screenShader.set1f(gl, "uTime", angle)

    gl.bindVertexArray(screenVao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function mainUI() {
}

function updateShape(boxTranslation: vec3, boxVelocity: vec3, dt: number) {
  boxTranslation[0] += boxVelocity[0] * dt;
  if (boxTranslation[0] >= 1.0) {
    boxTranslation[0] = 0.75
    boxVelocity[0] = -1
  }
  if (boxTranslation[0] <= -1.0) {
    boxTranslation[0] = -0.75
    boxVelocity[0] = 1
  }


  boxTranslation[1] += boxVelocity[1] * dt;
  if (boxTranslation[1] >= 1.0) {
    boxTranslation[1] = 0.75
    boxVelocity[1] = -1
  }
  if (boxTranslation[1] <= -1.0) {
    boxTranslation[1] = -0.75
    boxVelocity[1] = 1
  }

}


main()
