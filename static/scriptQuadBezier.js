

initPlot2();
launchXFoil();






document.addEventListener('mousedown', function(event) {

    let ball2 = event.target.closest('.point2');
    if (!ball2) return;
    ball = d3.select(ball2);
    plot = plot2;

    startDrag(event);

    function startDrag(event) {

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
        let relativeX = pageX -plot.getBoundingClientRect().left;
        let relativeY = pageY -plot.getBoundingClientRect().top;
        //Allow horizontal movement of the points
        /*
        if (relativeX <= plot.getBoundingClientRect().right-plot.getBoundingClientRect().left && relativeX >= 0){
        ball.attr('cx', relativeX);
        }
        else if(relativeX > plot.getBoundingClientRect().right-plot.getBoundingClientRect().left){
        ball.attr('cx', plot.getBoundingClientRect().right-plot.getBoundingClientRect().left);
        }
        else{
        ball.attr('cx', 0);
        }*/
        if (relativeY <= plot.getBoundingClientRect().bottom-plot.getBoundingClientRect().top && relativeY >= 0){
        ball.attr('cy', relativeY);
        }
        else if(relativeY > plot.getBoundingClientRect().bottom-plot.getBoundingClientRect().top){
        ball.attr('cy', plot.getBoundingClientRect().bottom-plot.getBoundingClientRect().top);
        }
        else{
        ball.attr('cy', 0);
        }

        drawLine(numPoints2)
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);

    }

    document.addEventListener('mousemove', onMouseMove);

    window.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        ball.onmouseup = null;

        launchXFoil()
    };

    };


    ball.ondragstart = function() {
        return false;
    };
});



function drawLine( numPoints2){

 

    var width = document.getElementById("plot2_container").clientWidth, height = document.getElementById("plot2_container").clientHeight;
    var controlPoints = [];  
    for (let i = 1; i < numPoints2; i++){

        d3.select("#line200"+i.toString())
            .attr("x1", d3.select("#point200"+i.toString()).attr("cx"))
            .attr("y1", d3.select("#point200"+i.toString()).attr("cy"))
            .attr("x2", d3.select("#point200"+(i+1).toString()).attr("cx"))
            .attr("y2", d3.select("#point200"+(i+1).toString()).attr("cy"));

        controlPoints.push([parseInt(d3.select("#point200"+i.toString()).attr("cx")), parseInt(d3.select("#point200"+i.toString()).attr("cy"))])

    }

    d3.select("#line200"+numPoints2.toString())
        .attr("x1", d3.select("#point200"+numPoints2.toString()).attr("cx"))
        .attr("y1", d3.select("#point200"+numPoints2.toString()).attr("cy"))
        .attr("x2", d3.select("#point2001").attr("cx"))
        .attr("y2", d3.select("#point2001").attr("cy")); 
    controlPoints.push([parseInt(d3.select("#point200"+numPoints2.toString()).attr("cx")), parseInt(d3.select("#point200"+numPoints2.toString()).attr("cy"))])

    airfoil(controlPoints, 16, width, height);



}

function init(data, index){



    

    drawLine(numPoints1, numPoints2)
}



function convertToPixel(pointx, pointy, dimX, dimy){
    return [parseInt(pointx*dimX), parseInt(dimy*((-pointy+0.3)/0.6))];
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function initPlot2(){

    var width = document.getElementById("plot2_container").clientWidth, height = document.getElementById("plot2_container").clientHeight;
    let plot2 = document.getElementById('plot2');
    

    var controlPoints=[[1.0000000, 0.0012600],              
        [0.7638202, 0.0301515],
        [0.5362174, 0.0505161],
        [0.2570083, 0.0595755],
        [0.0954915, 0.0460489],
        [0.0000000, 0.012603],                            
        [0.0000000, -.012603],
        [0.0954915, -.0460489],
        [0.2570083, -.0595755],
        [0.5362174, -.0505161],
        [0.7638202, -.0301515],
        [1.0000000, -.0012600]];

    numPoints2 = controlPoints.length;
    var controlPointsX = []
    var controlPointsY = []
    var controlPointsPix = []


    for(let i = 0; i < numPoints2 ; i++){
        ctrlPts = convertToPixel(controlPoints[i][0], controlPoints[i][1], width, height);
        controlPointsX.push(ctrlPts[0]);
        controlPointsY.push(ctrlPts[1]);
        controlPointsPix.push([ctrlPts[0], ctrlPts[1]]);


    }

    for (let i = 1; i < numPoints2+1; i++){
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("id", "line200"+i.toString());
        line.setAttribute("class", "line2");
        line.setAttribute("stroke", "grey");
        line.setAttribute("stroke-width", 1);
        plot2.appendChild(line);

        delete line;

    }



    for (let i = 1; i < numPoints2+1; i++){
        let point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        
        point.setAttribute("cx", controlPointsX[i-1]);
        point.setAttribute("cy", controlPointsY[i-1]);
        point.setAttribute("r", "7");
        point.setAttribute("fill", "red")
        point.setAttribute("class", "point2");
        point.setAttribute("id", "point200"+i.toString());
        plot2.appendChild(point);

        delete point;

    }

    airfoil(controlPointsPix, 16, width, height);

    let sliderRe = d3
        .sliderBottom()
        .min(2e5)
        .max(1.5e6)
        //.width(300)
        //.tickFormat(d3.format('.2%'))
        .ticks(0)
        .step(1e5)
        .default(1e6)
        .displayValue(true)
        .on('end', val => {
          //d3.select('p#value-step').text(d3.format('.2%')(val));
          console.log(val);
          document.getElementById("Revalue").innerHTML = val
          launchXFoil()
        });

    var gRe = d3
        .select('div#sliderRe')
        .append('svg')
        .attr('class', "sliderBar")
        .append('g')
        .attr('transform', 'translate(30,30)');

    gRe.call(sliderRe);


    var sliderM = d3
        .sliderBottom()
        .min(0)
        .max(1.2)
        .ticks(0)
        .step(0.1)
        .default(0)
        .displayValue(true)
        .on('end', val => {
          //d3.select('p#value-step').text(d3.format('.2%')(val));
          console.log(val);
          document.getElementById("Mvalue").innerHTML = val
          launchXFoil()
        });

    var gM = d3
        .select('div#sliderM')
        .append('svg')
        .attr('class', "sliderBar")
        .append('g')
        .attr('transform', 'translate(30,30)');

    gM.call(sliderM);


    var sliderA = d3
        .sliderBottom()
        .min(-10)
        .max(50)
        .ticks(0)
        .step(1)
        .default(0)
        .displayValue(true)
        .on('end', val => {
          //d3.select('p#value-step').text(d3.format('.2%')(val));
          console.log(val);
          document.getElementById("Avalue").innerHTML = val
          launchXFoil()
        });

    var gA = d3
        .select('div#sliderA')
        .append('svg')
        .attr('class', "sliderBar")
        .append('g')
        .attr('transform', 'translate(30,30)');

    gA.call(sliderA);


    //launchXFoil();
    document.getElementById("point2001").classList.remove('point2');
    document.getElementById("point2006").classList.remove('point2');
    document.getElementById("point2007").classList.remove('point2');
    document.getElementById("point20012").classList.remove('point2');

    d3.select("#point2001").attr("visibility", "hidden");
    d3.select("#point2006").attr("visibility", "hidden");
    d3.select("#point2007").attr("visibility", "hidden");
    d3.select("#point20012").attr("visibility", "hidden");

    drawLine(numPoints2)


    //Cp plot 
    var margin = {top: 10, right: 10, bottom: 40, left: 50},
    width = 600 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;

    // 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([1, -1.5]) // input 
        .range([height, 0]); // output 

    /*// 7. d3's line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
     // apply smoothing to the line*/



    // 1. Add the SVG to the page and employ #2
    var svg = d3.select("#boxCp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // Add X axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2)
      .attr("y", height + margin.top + 20)
      .text("x/c");

    // Y axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - height/2 + 20)
      .text("Cp");

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#80cee1")
      .attr("stroke-width", 3)
      .attr('id', "pathCp")

}

function airfoil(ctlPts, numPointsBezier, width, height){
    removeElementsByClass("pointbezier"); 
    var curvex = [];
    var curvey = [];
    
    t = d3.range(0, 1/(numPointsBezier)*(numPointsBezier), 1/(numPointsBezier));
    
    var midX = (ctlPts[1][0]+ctlPts[2][0])/2;
    var midY = (ctlPts[1][1]+ctlPts[2][1])/2;
    var bezier = quadraticBezier(t,[ctlPts[0],ctlPts[1],[midX,midY]], width, height)
    curvex = curvex.concat(bezier[0]);
    curvey = curvey.concat(bezier[1]);



    for (let i = 1; i< ctlPts.length-3; i++){
        p0 = ctlPts[i];
        p1 = ctlPts[i+1];
        p2 = ctlPts[i+2];
        midX_1 = (ctlPts[i][0]+ctlPts[i+1][0])/2;
        midY_1 = (ctlPts[i][1]+ctlPts[i+1][1])/2;
        midX_2 = (ctlPts[i+1][0]+ctlPts[i+2][0])/2;
        midY_2 = (ctlPts[i+1][1]+ctlPts[i+2][1])/2;

        bezier = quadraticBezier(t,[[midX_1,midY_1],ctlPts[i+1],[midX_2,midY_2]], width, height);
        curvex = curvex.concat(bezier[0]);
        curvey = curvey.concat(bezier[1]);
         
    }
    
    midX=(ctlPts[ctlPts.length-3][0]+ctlPts[ctlPts.length-2][0])/2;
    midY=(ctlPts[ctlPts.length-3][1]+ctlPts[ctlPts.length-2][1])/2;
    bezier=quadraticBezier(t,[[midX,midY],ctlPts[ctlPts.length-2],ctlPts[ctlPts.length-1]], width, height);
    curvex = curvex.concat(bezier[0]);
    curvey = curvey.concat(bezier[1]);

    curvex.push(ctlPts[ctlPts.length-1][0]);
    curvey.push(ctlPts[ctlPts.length-1][1]);

   

    
    for (let i = 1; i < curvex.length+1; i++){
        let point = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        point.setAttribute("cx", curvex[i-1]);
        point.setAttribute("cy", curvey[i-1]);
        point.setAttribute("r", "2");
        point.setAttribute("fill", "blue")
        point.setAttribute("class", "pointbezier");
        point.setAttribute("id", "pointBezier"+i.toString());
        plot2.appendChild(point);

        delete point;

    }



}

function quadraticBezier(t,points, width, height){
    var B_x = [];
    var B_y = [];
    for(let i = 0; i < t.length; i++){
        //B_xy = convertToPixel((1-t[i])*((1-t[i])*points[0][0]+t[i]*points[1][0]) + t[i]*((1-t[i])*points[1][0]+t[i]*points[2][0]), (1-t[i])*((1-t[i])*points[0][1]+t[i]*points[1][1]) + t[i]*((1-t[i])*points[1][1]+t[i]*points[2][1]), width, height);
        B_x.push((1-t[i])*((1-t[i])*points[0][0]+t[i]*points[1][0]) + t[i]*((1-t[i])*points[1][0]+t[i]*points[2][0]));
        B_y.push((1-t[i])*((1-t[i])*points[0][1]+t[i]*points[1][1]) + t[i]*((1-t[i])*points[1][1]+t[i]*points[2][1]));
    }


    return [B_x,B_y];
}


function launchXFoil() {

    var width = document.getElementById("plot2_container").clientWidth, height = document.getElementById("plot2_container").clientHeight;
    var x = document.getElementsByClassName("point2");
    var ctrlX = "";
    var ctrlY = "";
    for (i = 0; i < x.length; i++) {
        ctrlX = ctrlX + " " + (x[i].getAttribute("cx")/width).toString();
        ctrlY = ctrlY + " " + (0.3-x[i].getAttribute("cy")*0.6/height).toString();
    }
    var python = $.ajax({
        url: "/hello",
        data: { x: ctrlX, y: ctrlY, Re: parseFloat(document.getElementById("Revalue").innerHTML), M: parseFloat(document.getElementById("Mvalue").innerHTML), Alpha: parseFloat(document.getElementById("Avalue").innerHTML)},
        dataType: 'JSON',
        type: 'GET',
        success: function(data){
            console.log(data.result);
            var result = data.result.split(" ");
            document.getElementById("resultCL").innerHTML = result[0];
            document.getElementById("resultCD").innerHTML = result[1];
            document.getElementById("resultCM").innerHTML = result[2];
            document.getElementById("resultLD").innerHTML = result[3];
            document.getElementById("resultVol").innerHTML = result[4];
            updateCp(data.xcp, data.cp);
        }
    });

}


function updateCp(xcp, cp){

    var margin = {top: 10, right: 10, bottom: 40, left: 50},
    width = 600 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;
    var n = 97;
    var dataset = d3.range(n).map(function(d, i) { return {"y": cp[i], "x":xcp[i] }})
        // 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([1, -1.5]) // input 
        .range([height, 0]); // output 

    d3.select('#pathCp')
      .datum(dataset)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function(d) { return xScale(d.x) })
        .y(function(d) { return yScale(d.y) })
        )


}