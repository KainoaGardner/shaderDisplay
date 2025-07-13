#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform float uPixelAmount;
uniform sampler2D uImage;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y) * uResolution;

    vec2 pixelSize = uResolution / uPixelAmount;
    vec2 blockUV = floor(uv / pixelSize) * pixelSize + pixelSize * 0.5;
    vec2 pixelUV = blockUV / uResolution;

    vec3 color = texture(uImage, pixelUV).xyz;
    outputColor = vec4(color, 1.0);
}
