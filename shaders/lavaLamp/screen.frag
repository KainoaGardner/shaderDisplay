#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec2 uLavaResolution;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 aspectRatioLavaLamp = uResolution / uLavaResolution;
    vec2 lavaUV = uv * aspectRatioLavaLamp;
    lavaUV.x += (1.0 - aspectRatioLavaLamp.x) * 0.5;
    lavaUV.y += (1.0 - aspectRatioLavaLamp.y) * 0.25;

    vec3 color = texture(uImage, lavaUV).xyz;

    outputColor = vec4(color, 1.0);
}
