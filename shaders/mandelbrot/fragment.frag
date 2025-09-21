#version 300 es
precision mediump float;

out vec4 outputColor;


uniform float uZoom;
uniform vec2 uMove;
uniform vec2 uResolution;

#define TWO_PI 6.28318530718

#define MAX_ITERATIONS 1000

const vec3 PALETTE_A = vec3(0.3,0.1,0.2);
const vec3 PALETTE_B = vec3(0.8,0.8,0.8);
const vec3 PALETTE_C = vec3(0.1,0.3,1.5);
const vec3 PALETTE_D = vec3(0.3,0.4,0.5);

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos( 6.28318*(c*t+d) );
}

int mandelSet(vec2 st){
  float x = 0.0;
  float y = 0.0;

  for (int i = 0;i < MAX_ITERATIONS;i++) {
    if (x*x + y*y > 4.0){
      return i;
    }

    float xTemp = x * x - y * y + st.x;
    y = 2.0 * x * y + st.y;

    x = xTemp;
  }

  
  return MAX_ITERATIONS;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    vec2 uv = st * 2.0 - 1.0;
    
    uv *= uZoom;

    uv += vec2(-0.5,0.0);
    uv += uMove;

    int i = mandelSet(uv);
    vec3 color = palette(float(MAX_ITERATIONS - i) * 0.03,PALETTE_A,PALETTE_B,PALETTE_C,PALETTE_D);  
    outputColor = vec4(color, 1.0);
}
