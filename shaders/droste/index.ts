import { Shader } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"

function sendSliderToCanvas(type:string, value: string) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: type, value: value }, "*")
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


let startTime = performance.now();
function mainCanvas() {
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

  let stop = 2;
  let angle = 5.0;
  let zoom = 1.5;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "ZOOM") {
      let x = parseInt(event.data.value)
      zoom = x * 0.1
    }
    if (event.data?.type === "COPY") {
      let x = parseInt(event.data.value)
      stop = x
    }
    if (event.data?.type === "ANGLE") {
      let x = parseInt(event.data.value)
      angle = x 
    }
  })

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  const mainTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, mainTexture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]!)

  const maskTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, maskTexture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[1]!)



  loading.style.display = "none"

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.8, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    gl.useProgram(shader.program)

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mainTexture)
    shader.set1i(gl, "uImage", 0)

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTexture)
    shader.set1i(gl, "uMask", 1)

    shader.set1f(gl, "uAngle", angle)
    shader.set1f(gl, "uZoom", zoom)
    shader.set1i(gl, "uStop", stop)

    gl.bindVertexArray(vao)
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

  const zoomSlider = document.getElementById("sliderZoom") as HTMLInputElement;
  zoomSlider.addEventListener("input", function(event) {
    sendSliderToCanvas("ZOOM",this.value)
  });

  const copySlider = document.getElementById("sliderCopy") as HTMLInputElement;
  copySlider.addEventListener("input", function(event) {
    sendSliderToCanvas("COPY",this.value)
  });

  const angleSlider = document.getElementById("sliderAngle") as HTMLInputElement;
  angleSlider.addEventListener("input", function(event) {
    sendSliderToCanvas("ANGLE",this.value)
  });


}


const imagePaths: string[] = [
  "../../assets/droste/main.png",
  "../../assets/droste/mask.png"
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
