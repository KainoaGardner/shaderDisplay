#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

float box(vec2 position, float size) {
    vec2 result = step(vec2(0.5) - size, position) - step(vec2(0.5) + size, position);
    return result.x * result.y;
}

vec2 brickTile(vec2 position, float zoom, float speed) {
    float time = uTime * speed;
    float move = step(1.0, mod(time, 2.0));
    position *= zoom;

    float oddRow = step(1.0, mod(position.y, 2.0));
    oddRow = oddRow * 2.0 - 1.0;
    position.x += oddRow * time * move;

    float oddCol = step(1.0, mod(position.x, 2.0));
    oddCol = oddCol * 2.0 - 1.0;
    position.y += oddCol * time * (1.0 - move);

    return fract(position);
}

void main() {
    vec2 position = gl_FragCoord.xy / uResolution;
    vec3 color = vec3(uTime);
    float speed = 5.0;

    position = brickTile(position, 5.0, speed);

    color = vec3(box(position, 0.1));

    outputColor = vec4(color, 1.0);
}
