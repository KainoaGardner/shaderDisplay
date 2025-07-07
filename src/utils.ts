
export class Shader {
  program: WebGLProgram;
  valid = false;

  constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !this.program) {
      console.error("could not create program")
      return
    }

    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      const compileError = gl.getShaderInfoLog(vertexShader);
      console.error(`Vertex: ${compileError}`);
      return
    }

    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      const compileError = gl.getShaderInfoLog(fragmentShader);
      console.error(`Fragment: ${compileError}`);
      return
    }

    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const compileError = gl.getProgramInfoLog(this.program);
      console.error(`Program Link: ${compileError}`);
      return
    }

    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    this.valid = true
  }

  set1i(gl: WebGL2RenderingContext, name: string, data: number) {
    const uniformLocation = gl.getUniformLocation(this.program, name)
    if (uniformLocation === null) {
      console.error(`could not get ${name} uniform location`)
      return;
    }
    gl.uniform1i(uniformLocation, data);
  }

  set1f(gl: WebGL2RenderingContext, name: string, data: number) {
    const uniformLocation = gl.getUniformLocation(this.program, name)
    if (uniformLocation === null) {
      console.error(`could not get ${name} uniform location`)
      return;
    }
    gl.uniform1f(uniformLocation, data);
  }

  set2f(gl: WebGL2RenderingContext, name: string, x: number, y: number) {
    const uniformLocation = gl.getUniformLocation(this.program, name)
    if (uniformLocation === null) {
      console.error(`could not get ${name} uniform location`)
      return;
    }
    gl.uniform2f(uniformLocation, x, y);
  }

  set3f(gl: WebGL2RenderingContext, name: string, x: number, y: number, z: number) {
    const uniformLocation = gl.getUniformLocation(this.program, name)
    if (uniformLocation === null) {
      console.error(`could not get ${name} uniform location`)
      return;
    }
    gl.uniform3f(uniformLocation, x, y, z);
  }

}


export function createVBO(gl: WebGL2RenderingContext, data: Float32Array) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error("Falied to createbuffer")
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return buffer;
}

export function createEBO(gl: WebGL2RenderingContext, data: Uint16Array) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error("Falied to createbuffer")
    return null;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return buffer;
}


export * as Utils from "./utils"
