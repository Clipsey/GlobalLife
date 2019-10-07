import * as THREE from 'three';
const projection = d3.geoEquirectangular()
  .translate([1024, 512])
  .scale(325);

export const createMapTexture = (json, color) => {
  const canvas = d3.select("body").append("canvas")
    .style('display', 'none')
    .attr('width', "2048px")
    .attr('height', "1024px");

  const context = canvas.node().getContext("2d");

  const path = d3.geoPath()
    .projection(projection)
    .context(context);

  context.strokeStyle = "#333";
  context.lineWidth = 1;
  context.fillStyle = color || "#fff";

  context.beginPath();

  path(json);

  context.fill();
  context.stroke();

  const texture = new THREE.Texture(canvas.node());
  texture.needsUpdate = true;

  canvas.remove();

  return texture;
}

