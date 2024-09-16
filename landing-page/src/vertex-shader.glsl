uniform vec3 intersectionPoint;
uniform vec2 gridSize;
uniform sampler2D noiseMap;
uniform float time;
uniform float pointSize;
uniform float sigma;
uniform float amplitude;
uniform float noiseIntensity;

varying vec3 vWorldPosition;

void main(){
  vec4 mvPosition=modelViewMatrix*vec4(position,1.);
  gl_PointSize=pointSize*(5./-mvPosition.z);// Correct for perspective
  
  // Map vertex position to UV coordinates for noise sampling
  vec2 uv=vec2((position.x/gridSize.x+.5),(position.z/gridSize.y+.5));
  
  // Scroll the UV coordinates over time
  uv.x=mod(uv.x+time*.025,1.);
  
  // Sample noise texture
  float noiseValue=texture2D(noiseMap,uv).r;
  
  // Apply noise to y-position
  vec3 modifiedPosition=position;
  modifiedPosition.y+=noiseValue*noiseIntensity;
  
  // Initialize transformed position
  vec3 transformed=modifiedPosition;
  
  // Apply falloff based on distance to intersection point
  float r=length(position.xz-intersectionPoint.xz);
  
  // Apply falloff to y-position
  transformed.y+=amplitude*exp(-r*r/(2.*sigma*sigma));
  
  // Apply model and projection matrices (standard)
  gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.);
  
  // Pass world position to fragment shader
  vWorldPosition=(modelMatrix*vec4(position,1.)).xyz;
}