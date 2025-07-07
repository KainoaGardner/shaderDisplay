#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

const int maxIterations = 6;

vec2 rotateCenter(vec2 pos, float a) {
    pos -= 0.5;
    mat2 rotMat = mat2(cos(a), -sin(a), sin(a), cos(a));
    pos *= rotMat;
    pos += 0.5;
    return pos;
}

void main() {
    vec2 pos = gl_FragCoord.xy / uResolution;

    float t = uTime * 0.5;
    pos = rotateCenter(pos, t);

    float zoomAmount = mod(t * 0.5, 1.0);
    float scale = pow(3.0, zoomAmount);
    vec2 targetTile = vec2(1.0);
    pos = (pos - targetTile) / scale + targetTile;

    vec3 color = vec3(1.0);

    vec2 hole = step(1.0 / 3.0, pos) - step(2.0 / 3.0, pos);
    float result = hole.x * hole.y;
    for (int i = 0; i < maxIterations; i++) {
        pos = fract(pos);
        hole = step(1.0 / 3.0, pos) - step(2.0 / 3.0, pos);
        result = hole.x * hole.y;
        if (result == 1.0) {
            break;
        }
        pos *= 3.0;
    }

    color = mix(vec3(0.0), color, result);
    outputColor = vec4(color, 1.0);
}
