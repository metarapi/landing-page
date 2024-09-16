uniform vec3 color;
uniform sampler2D map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec3 vWorldPosition;

void main(){
  // Sample the texture color
  vec4 textureColor=texture2D(map,gl_PointCoord);
  
  // Apply the uniform color to the texture color
  vec3 coloredTexture=textureColor.rgb*color;
  
  // Calculate fog depth
  vec3 fogOrigin=cameraPosition;
  float fogDepth=distance(vWorldPosition,fogOrigin);
  
  // Calculate fog factor
  float fogFactor=smoothstep(fogNear,fogFar,fogDepth);
  
  // Mix the colored texture with the fog color
  vec3 foggedColor=mix(coloredTexture,fogColor,fogFactor);
  
  // Set the final fragment color
  gl_FragColor=vec4(foggedColor,textureColor.a);
}
