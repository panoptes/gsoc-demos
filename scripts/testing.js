let orbitalPeriod = 2.2; 
let current = 0;
let canvasIds = ['canvasOne','canvasTwo','canvasThree','canvasFour'];
let angularPosition = 0;

function resizeCanvas(canvasId) {
    let mainCanvas = document.getElementById(canvasId);
    let height = $('#' + canvasId).height();
    let width = $('#' + canvasId).width();
    // Resize mainCanvas rendering grid to css mainCanvas dimensions
    mainCanvas.height = height;
    mainCanvas.width = width;
    return [height, width];
  }
  
  function mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, dataPointX, dataPointY, dataAxisXMax, dataAxisYMax) {
    let canvasPointX = (canvasXRange * (dataPointX - dataAxisXMin) / (dataAxisXMax - dataAxisXMin));
    let canvasPointY = (canvasYRange * (dataAxisYMax - dataPointY) / (dataAxisYMax - dataAxisYMin));
    return [canvasPointX, canvasPointY];
  }

let drawSemiOrbit = function (ctx, cx, cy, radius, inclination, direction) {
    let rx = radius;
    let ry = rx * (1 - Math.cos(inclination % 180 * Math.PI / 180));
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, direction);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    ctx.stroke();
}
  
let drawStar = function (ctx, cx, cy, radius) {
    // console.log(cx,cy,radius);
    starGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    starGradient.addColorStop(0.15, 'white');
    starGradient.addColorStop(1, 'rgba(248, 148, 6, 1)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = starGradient;
    ctx.fill();
}
  
let drawPlanet = function (ctx, cx, cy, angularPosition, radius, orbitalRadius, inclination) {
    let rx = orbitalRadius;
    let ry = orbitalRadius * (1 - Math.cos(inclination * Math.PI / 180));
    let orbitX = cx;
    let orbitY = cy;
    let planetX = orbitX - rx * Math.cos(angularPosition * Math.PI / 180);
    let planetY = orbitY + ry * Math.sin(angularPosition * Math.PI / 180);
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.arc(planetX, planetY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    // console.log([planetX,planetY]);
}
  
let drawStarSystem = function (ctx,starRadius,planetRelativeRadius, orbitalRadius, inclination, angularPosition,zoom = 1) {
    let height = ctx.canvas.height;
    let width = ctx.canvas.width;
    // Resizing clears the canvas.
    let centerX = width / 2;
    let centerY = height / 2;
    // console.log(centerX,centerY);
    ctx.clearRect(0,0,width,height);
    starRadius *= zoom;
    orbitalRadius *= zoom;
    if (angularPosition <= 180) {
      drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 1);
      drawStar(ctx, centerX, centerY, starRadius);
      drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 0);
      drawPlanet(ctx, centerX, centerY, angularPosition, planetRelativeRadius * starRadius, orbitalRadius,inclination);
      //  console.log(angularPosition);
    }
    else {
      drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 1);
      drawPlanet(ctx, centerX, centerY, angularPosition, planetRelativeRadius * starRadius, orbitalRadius, inclination);
      drawStar(ctx, centerX, centerY, starRadius);
      drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 0);
    }
}
let calcTransitParameters = function (r_star, r_planet, orbitalRadius, inclination) {
    let rx = orbitalRadius;
    let ry = rx * (1 - Math.cos(inclination * Math.PI / 180));
    let angularPositions = [];
    let d = [];
    let z = 0;
    let p = 0;
    let res = [];
    let i = 0;
    for (i = 0; i <= 180; i += 0.1) {
      angularPositions.push(i);
    }
    let a = 0;
    for (i = 0; i < angularPositions.length; i++) {
      a = angularPositions[i];
      dx = -rx * Math.cos(a * Math.PI / 180);
      dy = ry * Math.sin(a * Math.PI / 180);
      /* Using cartesian distance between two points which here are the center 
      (0,0) and the point on the ellipstical orbit given by: 
      (-rx * cos(angularPosition), ry * sin(angularPosition))
      */
      d.push(Math.sqrt(dx * dx + dy * dy));
    }
  
    for (i = 0; i < d.length; i++) {
      z = d[i] / r_star;
      p = r_planet / r_star;
      let temp = 0;
      if ((1 + p) < z) {
        temp = 0;
      }
      else if (z <= (1 - p)) {
        temp = p * p;
      }
      else if (z <= (p - 1)) {
        temp = 1;
      }
      else if ((Math.abs(1 - p) < z) && (z <= 1 + p)) {
        k1 = Math.acos((1 - p * p + z * z) / (2 * z));
        k0 = Math.acos((p * p + z * z - 1) / (2 * p * z));
        temp = (p * p * k0 + k1 - Math.sqrt(z * z - Math.pow((1 + z * z - p * p), 2) / 4)) / Math.PI;
      }
      res.push(temp);
    }
    res = res.map(function (a) { return 1 - a; });
    return {
      z: z,
      p: p,
      distances: d,
      relativeBrightness: res,
      transitDepth: res.reduce(function (a, b) { return Math.min(a, b); }),
    }
}

let drawTransitCurve = function (canvasId, transitParameters) {
    let mainCanvas = document.getElementById(canvasId);
    let ctx = mainCanvas.getContext('2d');
    [height, width] = resizeCanvas(canvasId);
    let pixelX = 0;
    let pixelY = 0;
    let pixelCoords = [];
    let dataAxisXMax = 3600;
    let dataAxisXMin = 0;
    let dataAxisYMax = 100;
    let dataAxisYMin = Math.floor(transitParameters.transitDepth * 100 - 1);
    paddingSides = Math.round(0.12 * width);
    paddingTopBottom = Math.round(0.12 * height);
    let canvasXRange = width - 2 * paddingSides;
    let canvasYRange = height - 2 * paddingTopBottom;
    let gridLinesX = 36;
    let gridLinesY = 20;
    ctx.strokeStyle = "#dfdfdf";
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    // Chart outline
    ctx.rect(paddingSides, paddingTopBottom, canvasXRange, canvasYRange);
    // Chart grid
    for (let dist = 0; dist < canvasYRange; dist += canvasYRange / gridLinesY) {
      ctx.moveTo(paddingSides, paddingTopBottom + dist);
      ctx.lineTo(paddingSides + canvasXRange, paddingTopBottom + dist);
    }
    for (let dist = 0; dist < canvasXRange; dist += canvasXRange / gridLinesX) {
      ctx.moveTo(paddingSides + dist, paddingTopBottom);
      ctx.lineTo(paddingSides + dist, paddingTopBottom + canvasYRange);
    }
    ctx.stroke();
  
    let xOffset = paddingSides;
    let yOffset = paddingTopBottom;
    let fontSize = Math.min(paddingTopBottom / 3, 20);
    let text = "Transit Light Curve"
    ctx.font = fontSize + "px Verdana";
    let startX = width / 2 - ctx.measureText(text).width / 2;
    ctx.fillText(text, startX, 2 * paddingTopBottom / 3);
    // Transit Light Curve drawing to chartCanavs
    relativeBrightness = transitParameters.relativeBrightness;
    let xAxisPoints = 2 * (relativeBrightness.length - 1);
    for (let index = 0; index <= xAxisPoints; index++) {
      if (index < relativeBrightness.length) {
        [pixelX, pixelY] = mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, index, 100 * relativeBrightness[index], dataAxisXMax, dataAxisYMax);
      }
      else {
        [pixelX, pixelY] = mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, index, 100, xAxisPoints, dataAxisYMax);
      }
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(xOffset + pixelX, yOffset + pixelY, 1, 1);
      pixelCoords.push([pixelX, pixelY]);
    }
  
    for (let i = 0, j = 0; i <= gridLinesX || j <= gridLinesY; i += 4, j += 4) {
      let valueX = dataAxisXMin + i * (dataAxisXMax - dataAxisXMin) / gridLinesX;
      let valueY = dataAxisYMax - j * (dataAxisYMax - dataAxisYMin) / gridLinesY;
      ctx.fillStyle = "#1f1f1f";
      ctx.font = fontSize / 1.2 + "px Verdana";
      if (i < gridLinesX) {
        ctx.fillText(Math.round(orbitalPeriod * 10 * valueX / dataAxisXMax) / 10, paddingSides + i * canvasXRange / gridLinesX, height - 2 / 7 * paddingTopBottom);
      }
      else if (i = gridLinesX) {
        ctx.fillText(Math.round(orbitalPeriod * 10 * valueX / dataAxisXMax) / 10 + " days", paddingSides + i * canvasXRange / gridLinesX, height - 2 / 7 * paddingTopBottom);
      }
      if (j <= gridLinesY) {
        ctx.fillText(valueY + "%", 1 / 7 * paddingSides, paddingTopBottom + j * canvasYRange / gridLinesY);
      }
  
    }
  
    return pixelCoords;
}

let questions = [];

questions.push({
    qType:"transit-curve",
    qText:"choose the system that corresponds to the transit curve",
    options:[{
        starRadius:50,
        planetRadius:20,
        orbitalRadius:80,
        inclination:75
    },{
        starRadius:30,
        planetRadius:20,
        orbitalRadius:60,
        inclination:30
    },{
        starRadius:40,
        planetRadius:20,
        orbitalRadius:70,
        inclination:0
    },{
        starRadius:30,
        planetRadius:10,
        orbitalRadius:60,
        inclination:90
    }],
    rightOption: 2,
});

function dimensionsFromString(str) {
    str = str.substr(0, str.indexOf('px'));
    return Number(str);
  }

function starParametersObject(r_star,r_planet,orbital_radius,inclination_angle){
    return {
        starRadius: r_star,
        planetRelativeRadius: r_planet,
        orbitalRadius: orbital_radius,
        inclination: inclination_angle
    };
}

let renderButton = function(elementId){
  if(elementId === "nextButton"){
    if(current===questions.length - 1){
      // If last question disable next button
      $('#'+elementId).attr('disabled',true);
    }
    else{
      // set disabled attribute to false on button
      $('#'+elementId).attr('disabled',false);
    }
  }
  else if (elementId === "prevButton"){
    if(current === 0 ){
      // If first question disable "previous" button
      $('#'+elementId).attr('disabled',true);
    }
    else{
      $('#'+elementId).attr('disabled',false);
    }
  }
} 

let renderCanvas= function () {
    angularPosition += 2;
    angularPosition %= 360;
    let question = questions[current];
    let sysParams = question.options[question.rightOption];
    let mainCanvas = document.getElementById('mainCanvas');
    let mainCssH = Math.floor(dimensionsFromString($('#mainCanvas').css('height')));
    let mainCssW = Math.floor(dimensionsFromString($('#mainCanvas').css('width')));
    // Main Canvas update
    if ( mainCssH!= mainCanvas.height || mainCssW != mainCanvas.width ) {
      let [h,w] = resizeCanvas('mainCanvas');
      resizeCanvas('canvasOne');
      resizeCanvas('canvasTwo');
      resizeCanvas('canvasThree');
      resizeCanvas('canvasFour');
      drawTransitCurve('mainCanvas',calcTransitParameters(sysParams.starRadius,sysParams.planetRadius,sysParams.orbitalRadius,sysParams.inclination));
    }
    //option Canvas update
    let ctx = ""; 
    let params = {}; 
    for(let i=0;i<canvasIds.length;i++){
        ctx = document.getElementById(canvasIds[i]).getContext('2d');
        params = questions[current].options[i];
        drawStarSystem(ctx,params.starRadius,params.planetRadius/params.starRadius,params.orbitalRadius,params.inclination,angularPosition);
    }
    starSystemAnimationId = requestAnimationFrame(renderCanvas);
  }
  
  let optionOnClick = function(option,element){
    if(option == questions[current].rightOption){
      console.log('You got it right !',element);
    }
    else{
      console.log('You got it wrong :(',element);
    }
    return 0;
  }
  
