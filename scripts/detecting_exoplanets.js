let mainSvg = d3.select('#mainSvg');
paperHeight = mainSvg.attr('height');
paperWidth = mainSvg.attr('width');

function drawStar(cx,cy,r){
  let starUpper = d3.select('#starUpper');
  let starLower = d3.select('#starLower');
  let starUpperSemicircle = d3.select('#starSemicircle>path');
  let dArray = ["M",cx-r,cy,"A",r,r,0,1,1,cx+r,cy];
  starLower.attr('cx',cx)
    .attr('cy',cy)
    .attr('r',r)
    .attr('fill','url("#starColor")')
    .attr('filter','url("#glow")');
  starUpperSemicircle.attr("d",dArray.join(" "))
    .attr("fill","white");
  starUpper.attr('cx',cx)
    .attr('cy',cy)
    .attr('r',r)
    .attr('fill','url("#starColor")')
    .attr('filter','url("#glow")');
}

function drawOrbitAndPlanet(planetRelativeRadius,inclination,orbitDistance){
  /* planetRelativeRadius - Radius of planet in terms of the parent star radius
     inclination - Inclination of the orbit as seen from the earth
     orbitDistance - The distance of the orbit from the parent star
  */
}
drawStar(200,200,20);