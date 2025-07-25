import { Utils } from "./utils"

export const SQUARE_VERTICES = new Float32Array([
  -1.0, -1.0,
  1.0, -1.0,
  1.0, 1.0,
  -1.0, 1.0
]);

export const SQUARE_INDICES = new Uint16Array([
  0, 1, 2,
  0, 2, 3,
]);

export const TEXTURE_VERTICES = new Float32Array([
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
]);

export const TEXTURE_INDICES = new Uint16Array([
  0, 1, 2,
  0, 2, 3
]);


export const CUBE_VERTICES = new Float32Array([
  // front back
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,

  // up down
  -0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5,
  -0.5, -0.5, 0.5,
  -0.5, 0.5, 0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  0.5, 0.5, 0.5,
  0.5, -0.5, 0.5,

  // left right
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, -0.5, 0.5,
  -0.5, -0.5, 0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
]);


export const CUBE_INDICES = new Uint16Array([
  // front and back
  0, 3, 2, 2, 1, 0, 4, 5, 6, 6, 7, 4,
  // left and right
  11, 8, 9, 9, 10, 11, 12, 13, 14, 14, 15, 12,
  // bottom and top
  16, 17, 18, 18, 19, 16, 20, 21, 22, 22, 23, 20]);


export function createPosGeometry(
  gl: WebGL2RenderingContext,
  vertexData: Float32Array,
  vertexElementData: Uint16Array,
  vertexDataSize: number,
  attribLocation: number,
) {
  const vao = gl.createVertexArray();
  if (!vao) {
    console.error("Falied to make vertex array");
  }

  const vbo = Utils.createVBO(gl, vertexData);
  const ebo = Utils.createEBO(gl, vertexElementData);
  if (!vbo || !ebo) {
    console.error("could not make vbo/ebo")
    return null
  }

  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(attribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(attribLocation, vertexDataSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return vao;
}

export function createPosTexGeometry(
  gl: WebGL2RenderingContext,
  vertexData: Float32Array,
  vertexElementData: Uint16Array,
  vertexDataSize: number,
  attribLocation: number,
  vertexTextureData: Float32Array,
  vertexElementTextureData: Uint16Array,
  textureDataSize: number,
  textureAttribLocation: number,
) {
  const vao = gl.createVertexArray();
  if (!vao) {
    console.error("Falied to make vertex array");
  }

  const vbo = Utils.createVBO(gl, vertexData);
  const ebo = Utils.createEBO(gl, vertexElementData);
  if (!vbo || !ebo) {
    console.error("could not make vbo/ebo")
    return null
  }

  const textureVbo = Utils.createVBO(gl, vertexTextureData);
  const textureEbo = Utils.createEBO(gl, vertexElementTextureData);
  if (!textureVbo || !textureEbo) {
    console.error("could not make vbo/ebo")
    return null
  }


  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(attribLocation);
  gl.enableVertexAttribArray(textureAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(attribLocation, vertexDataSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);

  gl.bindBuffer(gl.ARRAY_BUFFER, textureVbo);
  gl.vertexAttribPointer(textureAttribLocation, textureDataSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, textureEbo);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return vao;
}

export * as Geometry from "./geometry"
