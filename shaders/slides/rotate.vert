#version 300 es
precision mediump float;

in vec2 aPosition;

in vec2 aTexCoord;
out vec2 vTexCoord;

uniform mat4 uModel;
uniform mat4 uProjection;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uModel * vec4(aPosition, 0.0, 1.0);
}
