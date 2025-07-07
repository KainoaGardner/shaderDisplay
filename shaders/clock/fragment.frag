#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform vec3 uCurrTime; //hr,min,sec

#define TWO_PI 6.28318530718

float bin(vec2 iPos, float n) {
    float remain = mod(n, 33554432.);
    for (float i = 0.; i < 25.; i++) {
        if (floor(i / 3.) == iPos.y && mod(i, 3.) == iPos.x) {
            return step(1., mod(remain, 2.));
        }
        remain = ceil(remain / 2.);
    }

    return 0.0;
}

float char(vec2 st, float n, vec2 scale, vec2 translate) {
    st.x = st.x * scale.x - translate.x;
    st.y = st.y * scale.y - translate.y;

    vec2 grid = vec2(3., 5.);

    vec2 iPos = floor(st * grid);
    vec2 fPos = fract(st * grid);

    n = floor(mod(n, 11.));
    float digit = 0.0;
    if (n < 1.) {
        digit = 31600.;
    }
    else if (n < 2.) {
        digit = 9363.;
    }
    else if (n < 3.) {
        digit = 31184.;
    }
    else if (n < 4.) {
        digit = 31208.;
    }
    else if (n < 5.) {
        digit = 23525.;
    }
    else if (n < 6.) {
        digit = 29672.;
    }
    else if (n < 7.) {
        digit = 29680.;
    }
    else if (n < 8.) {
        digit = 31013.;
    }
    else if (n < 9.) {
        digit = 31728.;
    }
    else if (n < 10.) {
        digit = 31717.;
    }
    else if (n < 11.) {
        digit = 1041.;
    }
    float pct = bin(iPos, digit);

    vec2 borders = vec2(1.);
    borders *= step(0.1, fPos.x) * step(0.1, fPos.y); //inner
    borders *= step(0.0, st) * step(0.0, 1. - st); //outer

    return step(0.5, 1. - pct) * borders.x * borders.y;
}

vec2 rotateCenter(vec2 pos, float a) {
    pos -= 0.5;
    mat2 rotMat = mat2(cos(a), -sin(a), sin(a), cos(a));
    pos *= rotMat;
    pos += 0.5;
    return pos;
}

vec2 rectangle(vec2 pos, vec2 size, vec2 translate) {
    translate += 0.5;
    size /= 2.0;
    vec2 result = step(translate - size, pos) - step(translate + size, pos);
    return result;
}

float circle(vec2 pos, vec2 translate, float radius) {
    translate += 0.5;
    float dist = distance(pos, translate);
    float result = step(dist, radius);
    return result;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    vec3 color = vec3(0.0);

    vec2 circleTranslate = vec2(0.0);
    float circleResult = circle(st, circleTranslate, 0.5);
    vec3 circleColor = vec3(0.8);
    color = mix(color, circleColor, circleResult);

    float sec = mod(uCurrTime.z, 60.);
    float min = mod(uCurrTime.y, 60.);
    float hour = mod(uCurrTime.x, 12.);

    float digit0 = mod(sec, 10.);
    float digit1 = mod(sec / 10., 10.);
    float digit2 = mod(min, 10.);
    float digit3 = mod(min / 10., 10.);
    float digit4 = mod(hour, 10.);
    float digit5 = mod(hour / 10., 10.);
    float digits[6] = float[6](digit0, digit1, digit2, digit3, digit4, digit5);

    vec2 zoom = vec2(6., 1.);

    st -= vec2(0.5);
    st *= zoom;
    st += vec2(0.5 * zoom);

    vec2 iPos = floor(st);
    vec2 fPos = fract(st);

    // vec2 offset = vec2(mod(iPos.x,2.) * -0.5,zoom.x / 2. - 0.5);
    vec2 offset = vec2(0., zoom.x / 2. - 0.5);
    fPos *= vec2(1., zoom.x);
    fPos -= vec2(offset);

    int col = int(5. - iPos.x);
    vec2 scale = vec2(1.25, 1.2);
    vec2 translate = vec2(0.125, 0.1);
    vec3 charPct = vec3(char(fPos, digits[col], scale, translate));

    st += vec2(0.5, 0.);

    iPos = floor(st);
    fPos = fract(st);

    zoom *= vec2(3., 0.);
    fPos *= vec2(1., zoom.x);
    fPos -= vec2(0., zoom.x / 2. - 0.5);

    scale = vec2(2., 1.2);
    translate = vec2(.523, .1);
    float colonPct = char(fPos, 10., scale, translate);
    colonPct *= mod(iPos.x + 1., 2.) * (step(2., iPos.x) - step(5., iPos.x));

    vec3 charResult = vec3(charPct + colonPct);
    vec3 charColor = vec3(0.0);

    color = mix(color, charColor, charResult);
    // vec3 color = vec3(charPct);

    vec2 st2 = gl_FragCoord.xy / uResolution;

    st2 = rotateCenter(st2, hour * (TWO_PI / 12.0));
    vec2 rectScale = vec2(0.05, 0.2);
    vec2 rectTranslate = vec2(0.0, 0.1);
    vec2 rectResult = rectangle(st2, rectScale, rectTranslate);
    vec3 clockHourColor = vec3(0.2, 0.2, 0.2);
    color = mix(color, clockHourColor, rectResult.x * rectResult.y);

    vec2 st1 = gl_FragCoord.xy / uResolution;
    st1 = rotateCenter(st1, min * (TWO_PI / 60.0));
    rectScale = vec2(0.03, 0.4);
    rectTranslate = vec2(0.0, 0.2);
    rectResult = rectangle(st1, rectScale, rectTranslate);
    vec3 clockMinColor = vec3(0.5, 0.5, 0.5);
    color = mix(color, clockMinColor, rectResult.x * rectResult.y);

    vec2 st0 = gl_FragCoord.xy / uResolution;
    st0 = rotateCenter(st0, sec * (TWO_PI / 60.0));
    rectScale = vec2(0.01, 0.45);
    rectTranslate = vec2(0.0, 0.225);
    rectResult = rectangle(st0, rectScale, rectTranslate);
    vec3 clockSecColor = vec3(1.0, 0.0, 0.0);

    color = mix(color, clockSecColor, rectResult.x * rectResult.y);
    outputColor = vec4(color, 1.0);
}
