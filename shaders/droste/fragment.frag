#version 300 es
precision mediump float;

#define MAX_ITERATIONS 100

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;

uniform int uStop;
uniform float uZoom;
uniform float uAngle;

uniform sampler2D uImage;
uniform sampler2D uMask;

vec2 rotate(vec2 v,float a){
  float c = cos(a);
  float s = sin(a);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    vec3 mainColor = texture(uImage,uv).rgb;
    float mask = texture(uMask,uv).a;

    vec2 drosteUV = uv - 0.5;

    bool outOfBounds = false;

    int i = 0;
    for (i = 0; i < MAX_ITERATIONS; i++){
      if (i >= uStop){
        break;
      }

      drosteUV = rotate(drosteUV,radians(uAngle));
      drosteUV *= uZoom;
      drosteUV += 0.5;

      float mask = texture(uMask,drosteUV).a;
      if (mask != 1.0){
        break;
      }

      drosteUV -= 0.5;
    }
    
    if (i == MAX_ITERATIONS || i == uStop){
      drosteUV += 0.5;
    }

    vec3 maskColor = texture(uImage,drosteUV).rgb;

    vec3 color = mix(mainColor,maskColor,mask);
    outputColor = vec4(color, 1.0);
}

