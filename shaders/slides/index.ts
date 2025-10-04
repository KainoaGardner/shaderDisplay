import { Shader } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import slideHoriFragmentSource from "./slideHori.frag?raw"
import slideVertFragmentSource from "./slideVert.frag?raw"
import fadeFragmentSource from "./fade.frag?raw"
import dissolveFragmentSource from "./dissolve.frag?raw"
import blockFragmentSource from "./block.frag?raw"
import spiralFragmentSource from "./spiral.frag?raw"
import circleFragmentSource from "./circle.frag?raw"
import clockFragmentSource from "./clock.frag?raw"

import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"

function sendTransitionToCanvas(type:string) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: type }, "*")
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

  const slideHoriShader = new Shader(gl, vertexSource, slideHoriFragmentSource)
  if (!slideHoriShader.valid) {
    console.error("could not make shader hori")
    return;
  }

  const slideVertShader = new Shader(gl, vertexSource, slideVertFragmentSource)
  if (!slideVertShader.valid) {
    console.error("could not make shader vert")
    return;
  }

  const fadeShader = new Shader(gl, vertexSource, fadeFragmentSource)
  if (!fadeShader.valid) {
    console.error("could not make shader fade")
    return;
  }

  const dissolveShader = new Shader(gl, vertexSource, dissolveFragmentSource)
  if (!dissolveShader.valid) {
    console.error("could not make shader dissolve")
    return;
  }

  const blockShader = new Shader(gl, vertexSource, blockFragmentSource)
  if (!blockShader.valid) {
    console.error("could not make shader block")
    return;
  }

  const spiralShader = new Shader(gl, vertexSource, spiralFragmentSource)
  if (!spiralShader.valid) {
    console.error("could not make shader spiral")
    return;
  }

  const circleShader = new Shader(gl, vertexSource, circleFragmentSource)
  if (!circleShader.valid) {
    console.error("could not make shader circle")
    return;
  }

  const clockShader = new Shader(gl, vertexSource, clockFragmentSource)
  if (!clockShader.valid) {
    console.error("could not make shader clock")
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

  const slide1Texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, slide1Texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]!)

  const slide2Texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, slide2Texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[1]!)

  
  loading.style.display = "none"

  let currShader = shader;
  let transition = ""
  let mainImage = 0;
  let startTime = performance.now()
  let reverse = 1.0;
  let speed = 1.5;
  let reverseOn = false;

  window.addEventListener("message", (event) => {
    if (event.data?.type === "reverseToggle"){
      reverseOn = !reverseOn
      if (transition === ""){
        reverse *= -1
      }
    } else if (transition === ""){
      startTime = performance.now()
      transition = event.data?.type
    }
  })

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  const frame = function() {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;

    const currFrameTime = performance.now()
    const timePassed = (currFrameTime - startTime) / 1000;
    
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (transition === ""){
      defaultRender(gl,currShader,mainImage)
    }else {
      switch (transition){
        case "slideHori":
          currShader = slideHoriShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "slideVert":
          currShader = slideVertShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "fade":
          currShader = fadeShader
          drawFade(gl,currShader,mainImage,timePassed,speed)
          break;
        case "dissolve":
          currShader = dissolveShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "block":
          currShader = blockShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "spiral":
          currShader = spiralShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "circle":
          currShader = circleShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;
        case "clock":
          currShader = clockShader
          drawTransition(gl,currShader,mainImage,timePassed,reverse,speed)
          break;

      }
      if (timePassed * speed >= 1.0){
        transition = ""
        currShader = shader
        mainImage = (mainImage + 1) % 2

        if (reverseOn){
          reverse = -1.0;
        }else{
          reverse = 1.0;
        }
      }
    }

    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, Geometry.SQUARE_INDICES.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null)

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function defaultRender(gl:WebGL2RenderingContext,currShader:Shader,mainImage:number){
    gl.useProgram(currShader.program)
    currShader.set1i(gl,"uSlide1",mainImage)
}

function drawTransition(gl:WebGL2RenderingContext,currShader:Shader,mainImage:number,timePassed:number,reverse:number,speed:number){
  gl.useProgram(currShader.program)
  currShader.set1i(gl,"uSlide1",mainImage)
  currShader.set1i(gl,"uSlide2",(mainImage + 1) % 2)

  currShader.set1f(gl, "uTime", timePassed)
  currShader.set1f(gl,"uReverse",reverse)
  currShader.set1f(gl, "uSpeed", speed)
}

function drawFade(gl:WebGL2RenderingContext,currShader:Shader,mainImage:number,timePassed:number,speed:number){
  gl.useProgram(currShader.program)
  currShader.set1i(gl,"uSlide1",mainImage)
  currShader.set1i(gl,"uSlide2",(mainImage + 1) % 2)

  currShader.set1f(gl, "uTime", timePassed)
  currShader.set1f(gl, "uSpeed", speed)
}

function mainUI() {
  const loading = document.getElementById("loading") as HTMLCanvasElement;
  if (!loading) {
    console.error("cant find canvas");
    return
  }

  loading.style.display = "none"

  const reverseBox = document.getElementById("reverse") as HTMLElement;
  reverseBox.addEventListener("change", function() {
    sendTransitionToCanvas("reverseToggle")
  });

  const horiButton = document.getElementById("hori") as HTMLElement;
  horiButton.addEventListener("click", function() {
    sendTransitionToCanvas("slideHori")
  });

  const vertButton = document.getElementById("vert") as HTMLElement;
  vertButton.addEventListener("click", function() {
    sendTransitionToCanvas("slideVert")
  });

  const fadeButton = document.getElementById("fade") as HTMLElement;
  fadeButton.addEventListener("click", function() {
    sendTransitionToCanvas("fade")
  });

  const dissolveButton = document.getElementById("dissolve") as HTMLElement;
  dissolveButton.addEventListener("click", function() {
    sendTransitionToCanvas("dissolve")
  });

  const blockButton = document.getElementById("block") as HTMLElement;
  blockButton.addEventListener("click", function() {
    sendTransitionToCanvas("block")
  });

  const spiralButton = document.getElementById("spiral") as HTMLElement;
  spiralButton.addEventListener("click", function() {
    sendTransitionToCanvas("spiral")
  });

  const circleButton = document.getElementById("circle") as HTMLElement;
  circleButton.addEventListener("click", function() {
    sendTransitionToCanvas("circle")
  });

  const clockButton = document.getElementById("clock") as HTMLElement;
  clockButton.addEventListener("click", function() {
    sendTransitionToCanvas("clock")
  });

}



const imagePaths: string[] = [
  "../../assets/slides/slide1.png",
  "../../assets/slides/slide2.png"
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
