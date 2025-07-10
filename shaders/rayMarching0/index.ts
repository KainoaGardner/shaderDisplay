import { Shader } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"

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


let startTime = performance.now();
const mousePos = { x: 0, y: 0 }
let mousePressed = false

let speed = 1.0;

function mainCanvas() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("cant find canvas");
    return
  }

  document.addEventListener("mousedown", function(event) {
    mousePressed = true

    const rect0 = canvas.getBoundingClientRect()
    const mousePosX0 = event.clientX - rect0.left;
    const mousePosY0 = canvas.height - event.clientY + rect0.top;
    mousePos.x = mousePosX0
    mousePos.y = mousePosY0

  });
  document.addEventListener("mouseup", function(event) {
    mousePressed = false
  });

  document.addEventListener("mousemove", function(event) {
    const rect0 = canvas.getBoundingClientRect()
    const mousePosX0 = event.clientX - rect0.left;
    const mousePosY0 = canvas.height - event.clientY + rect0.top;

    if (mousePressed) {
      mousePos.x = mousePosX0
      mousePos.y = mousePosY0
    }
  });

  document.addEventListener("wheel", function(event) {
    speed += event.deltaY / -1000.0;
    console.log(speed)
  })

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

  const vao = Geometry.createPosGeometry(gl, Geometry.SQUARE_VERTICES, Geometry.SQUARE_INDICES, Geometry.SQUARE_INDICES.length / 3, aPositionAttribute);
  if (!vao) {
    console.error("could not make vao")
    return null
  }


  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shader.program)
    shader.set2f(gl, "uResolution", canvas.width, canvas.height)

    const currFrameTime = performance.now();
    const timePassed = (currFrameTime - startTime) / 1000;
    shader.set1f(gl, "uTime", timePassed)


    shader.set1f(gl, "uSpeed", speed)

    // console.log(mousePos.x, mousePos.y)
    // shader.set2f(gl, "uMouse", mousePos.x, mousePos.y)

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function mainUI() {
}


main()
