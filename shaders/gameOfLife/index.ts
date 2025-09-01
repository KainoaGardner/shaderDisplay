import { Shader, createScreenFrameBufferAlpha } from "../../src/utils"
import { Geometry } from "../../src/geometry"
import fragmentSource from "./fragment.frag?raw"
import vertexSource from "./vertex.vert?raw"
import screenFragmentSource from "./screen.frag?raw"
import screenVertexSource from "./screen.vert?raw"

type Mouse = {
  x: number;
  y: number;
  pressed: boolean[];
}

class Setup {
  width: number = 0;
  height: number = 0;
  grid: boolean[][] = [];
  cellWidth: number = 0;
  cellHeight: number = 0;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cellColor = "#FFF"

  constructor(canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D,width:number,height:number){
    this.canvas = canvas
    this.ctx = ctx
    this.updateSize(width,height)
  }

  updateSize(width:number,height:number){
    this.width = width
    this.height = height
    this.cellWidth = this.canvas.width / this.width
    this.cellHeight = this.canvas.height / this.height
    this.grid = Array.from({ length: height }, () => Array(width).fill(false))
  }

  clearGrid(){
    this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(false))
  }

  toggleCell(mouse:Mouse){
    const xCell = Math.floor(mouse.x / this.cellWidth)
    const yCell = Math.floor(mouse.y / this.cellHeight)
    if (0 <= xCell && xCell < this.grid[0].length && 0 <= yCell && yCell <= this.grid.length){
      if (mouse.pressed[0]){
        this.grid[yCell][xCell] = true
      }else if (mouse.pressed[2]){
        this.grid[yCell][xCell] = false
      }
    }
  }

  draw(){
    this.ctx.fillStyle = "#222"
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
    this.#drawCells()
    this.#drawGrid()
  }

  #drawGrid(){
     this.ctx.strokeStyle = "#999"
     this.ctx.lineWidth = this.cellWidth / 20
     this.ctx.globalAlpha = 0.5;

     for (let i = 0;i < this.height + 1;i++){
         this.ctx.beginPath()
         this.ctx.moveTo(0,i * this.cellHeight)
         this.ctx.lineTo(this.canvas.width,i * this.cellHeight)
         this.ctx.stroke()
     }

     for (let i = 0;i < this.width + 1;i++){
         this.ctx.beginPath()
         this.ctx.moveTo(i * this.cellWidth,0)
         this.ctx.lineTo(i * this.cellWidth,this.canvas.height)
         this.ctx.stroke()
     }

     this.ctx.globalAlpha = 1.0;
  }

  #drawCells(){
    this.ctx.fillStyle = this.cellColor
    for (let i = 0; i < this.height;i++){
      for (let j = 0; j < this.width;j++){
        if (this.grid[i][j]){
          this.ctx.fillRect(j * this.cellWidth,i * this.cellHeight,this.cellWidth,this.cellHeight)
        }
      }
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

    const canvas2d = document.getElementById("canvas2d") as HTMLCanvasElement;
    if (!canvas2d) {
      console.error("cant find canvas 2d");
      return
    }

    const setupUIDiv = document.getElementById("setup") as HTMLElement
    const simulationUIDiv = document.getElementById("simulation") as HTMLElement
    simulationUIDiv.style.display = "none"

    const startButton = document.getElementById("start") as HTMLElement;
    startButton.addEventListener("click", function() {
      sendStartToCanvas()
      simulationUIDiv.style.display = "block"
      setupUIDiv.style.display = "none"
    });

    const stopButton = document.getElementById("stop") as HTMLElement;
    stopButton.addEventListener("click", function() {
      sendStartToCanvas()
      simulationUIDiv.style.display = "none"
      setupUIDiv.style.display = "block"
    });

    const clearButton = document.getElementById("clear") as HTMLElement;
    clearButton.addEventListener("click", function() {
      sendClearToCanvas()
    });

    const colorSelector = document.getElementById("color") as HTMLInputElement;
    colorSelector.addEventListener("change", function(event) {
      const input = event.target as HTMLInputElement
      const color = input.value
      sendColorToCanvas(color)
    });

    const sizeInput = document.getElementById("size") as HTMLInputElement;
    sizeInput.addEventListener("change", function(event) {
      const input = event.target as HTMLInputElement
      let size = parseInt(input.value)
      if (size <= 0){
        input.value = "1"
        size = 1
      }else if (size > 100){
        input.value = "100"
        size = 100
      }
      sendSizeToCanvas(size)
    });

    canvas2d.style.display = "none"

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

  const gl = canvas.getContext("webgl2")
  if (!gl) {
    console.error("could not get webgl context")
    return;
  }

  const canvas2d = document.getElementById("canvas2d") as HTMLCanvasElement;
  if (!canvas) {
    console.error("cant find canvas");
    return
  }
  canvas.style.display = "none"

  const ctx = canvas2d.getContext("2d")
  if (!ctx) {
    console.error("could not get ctx")
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


  canvas2d.height = canvas2d.clientHeight;
  canvas2d.width = canvas2d.clientWidth;

  const mouse = {
    x: 0,
    y: 0,
    pressed: [false,false,false],
  }


  document.addEventListener("contextmenu", function(event) {
      event.preventDefault()
  });

  document.addEventListener("mousedown", function(event) {
    if (event.button <= 2) {
      mouse.pressed[event.button] = true
    }

  });
  document.addEventListener("mouseup", function(event) {
    if (event.button <= 2) {
      mouse.pressed[event.button] = false
    }

  });

  document.addEventListener("mousemove", function(event) {
    const rect0 = canvas2d.getBoundingClientRect()
    const mousePosX0 = event.clientX - rect0.left;
    const mousePosY0 = event.clientY - rect0.top;

    if (mouse.pressed) {
      mouse.x = mousePosX0
      mouse.y = mousePosY0
    }
  });


  loading.style.display = "none"

  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  let textureWidth = 10
  let textureHeight = 10

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


  const setup = new Setup(canvas2d,ctx,textureWidth,textureHeight)

  let screen = "setup";

  window.addEventListener("message", (event) => {
    if (event.data?.type === "START/STOP") {
      if (screen === "setup"){
        screen = "simulation"
        canvas2d.style.display = "none"
        canvas.style.display = "block"

        textureWidth = setup.width
        textureHeight = setup.height

      }else{
        screen = "setup"
        canvas2d.style.display = "block"
        canvas.style.display = "none"
      }
    }
    if (event.data?.type === "CLEAR") {
      setup.clearGrid()
    }
    if (event.data?.type === "COLOR") {
      const color = event.data.value
      setup.cellColor = color
    }
    if (event.data?.type === "SIZE") {
      const size = event.data.value
      setup.updateSize(size,size)

    }
  })

  const frame = function() {
    switch (screen){
      case "setup":{

        setup.toggleCell(mouse)
        setup.draw()
        break
      }
      case "simulation":{
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
    

        break
      }
    }
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

function sendStartToCanvas() {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "START/STOP" }, "*")
    } catch (e) {

    }
  }
}

function sendClearToCanvas() {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "CLEAR" }, "*")
    } catch (e) {

    }
  }
}

function sendColorToCanvas(color: string) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "COLOR", value: color }, "*")
    } catch (e) {

    }
  }
}

function sendSizeToCanvas(size: number) {
  const frames = window.parent.frames;
  for (let i = 0; i < frames.length; i++) {
    try {
      frames[i].postMessage({ type: "SIZE", value: size }, "*")
    } catch (e) {

    }
  }
}

main()
