let mainSvg = $('#mainSvg');
paperHeight = mainSvg.attr('height');
paperWidth = mainSvg.attr('width');

function drawStar(cx,cy,r){
  let starUpper = $('#starUpper');
  let starLower = $('#starLower');
  let starUpperSemicircle = $('#starSemicircle>path');
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

function drawOrbitAndPlanet(planetRelativeRadius,inclination,relativeOrbitDistance,orbitColor='#ffffff',orbitWidth=1,directionFlag=1){
  /* planetRelativeRadius - Radius of planet in terms of the parent star radius
     inclination - Inclination of the orbit as seen from the earth in degrees
     relativeOrbitDistance - The distance of the orbit from the parent star relative to parent star radius
     directionFlag - if 1 the planet revolves clockwise, if 0 revolves anticlockwise
  */
  let star = $('#starLower');
  let starRadius = star.attr('r');
  let cx = star.attr('cx');
  let cy = star.attr('cy');
  let planetRadius = planetRelativeRadius * starRadius;
  let rx = starRadius*relativeOrbitDistance;
  let ry = rx*Math.sin(inclination*Math.PI/180);
  let orbit = $('#orbit');
  let planet = $('#planet');
  let orbitD = ['M',cx-rx,cy,'a',rx,ry,0,0,directionFlag,2*rx,0,'a',rx,ry,0,0,directionFlag,-2*rx,0];
  orbit.attr('fill',"none")
       .attr('stroke',orbitColor)
       .attr('stroke-width',orbitWidth)
       .attr('d',orbitD.join(' '));
  planet.attr('r',planetRadius);
        
}
drawStar(200,200,20);