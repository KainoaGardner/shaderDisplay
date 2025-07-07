#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform vec2 uMouse;

uniform sampler2D uImage;

float circle(vec2 pos, vec2 mousePos, float r) {
    float d = distance(pos, mousePos);
    float result = step(d, r);

    return result;
}

float circleBorder(vec2 pos, vec2 mousePos, float r, float borderSize) {
    float d = distance(pos, mousePos);
    float result = step(d, r) - step(d + borderSize, r);

    return result;
}

void main() {
    vec2 mousePos = uMouse / uResolution;
    mousePos.y = 1.0 - mousePos.y;
    float zoom = 1.0 / 3.0;

    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 zoomUV = (uv - mousePos) * zoom + mousePos;

    float inCircleBorder = circleBorder(uv, mousePos, 0.15, 0.01);
    float inCircle = circle(uv, mousePos, 0.15);
    vec3 color = texture(uImage, uv).xyz;
    vec3 colorZoom = texture(uImage, zoomUV).xyz;

    float d = distance(mousePos, uv);
    color = mix(color, vec3(0.0), min(pow(d, 0.5), 0.95));

    color = mix(color, colorZoom, inCircle);
    color = mix(color, vec3(1.0), inCircleBorder);

    outputColor = vec4(color, 1.0);
}
