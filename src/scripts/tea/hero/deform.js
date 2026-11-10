// A bend for meshes with no skeleton (a pose-baked TRELLIS mesh): past `start` along the mesh's -z (a tail behind
// the body) every vertex is wrapped onto an arc curling toward +y, its normal turned with it. The uniform `bend`'s
// value is the curvature in 1/units (0 = straight); the `bend` channel of a track or idle wave adds to it.
const HEAD = `
uniform float uBend; uniform float uBendStart; uniform float uBendY;
vec3 teaBend(vec3 p, out float th) {
  float s = max(uBendStart - p.z, 0.0);
  float k = abs(uBend) < 1e-4 ? 1e-4 : uBend;
  th = k * s;
  float r = 1.0 / k;
  float h = p.y - uBendY;
  vec3 q = p;
  q.z = uBendStart - (r - h) * sin(th);
  q.y = uBendY + r - (r - h) * cos(th);
  if (s <= 0.0) { q = p; th = 0.0; }
  return q;
}
`;

export function addBend(material, spec, bend) {
  const uniforms = {
    uBend: bend,
    uBendStart: { value: Number(spec.start ?? 0) },
    uBendY: { value: Number(spec.y ?? 0) },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + HEAD)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
  float teaTh; vec3 teaP = teaBend(position, teaTh);
  float tc = cos(teaTh), ts = sin(teaTh);
  objectNormal = vec3(objectNormal.x, objectNormal.y * tc - objectNormal.z * ts, objectNormal.y * ts + objectNormal.z * tc);`)
      .replace('#include <begin_vertex>', 'vec3 transformed = teaP;');
  };
  material.customProgramCacheKey = () => 'tea-bend';
}
