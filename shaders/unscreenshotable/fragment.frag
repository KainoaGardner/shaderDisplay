#version 300 es
precision mediump float;

out vec4 outputColor;

void main() {
    vec3 color = vec3(1.0);
    outputColor = vec4(color, 1.0);
}
