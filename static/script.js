
loadCSV();
init2();

document.getElementById('airfoil_selection').addEventListener('change', function() {
  init(data, this.value);

});


function drawLine(numPoints1){

    for (let i = 1; i < numPoints1; i++){

        d3.select("#line"+i.toString())
            .attr("x1", d3.select("#point"+i.toString()).attr("cx"))
            .attr("y1", d3.select("#point"+i.toString()).attr("cy"))
            .attr("x2", d3.select("#point"+(i+1).toString()).attr("cx"))
            .attr("y2", d3.select("#point"+(i+1).toString()).attr("cy"));

    }

    d3.select("#line"+numPoints1.toString())
        .attr("x1", d3.select("#point"+numPoints1.toString()).attr("cx"))
        .attr("y1", d3.select("#point"+numPoints1.toString()).attr("cy"))
        .attr("x2", d3.select("#point1").attr("cx"))
        .attr("y2", d3.select("#point1").attr("cy")); 


}

function init(data, index){

    removeElementsByClass("point"); 
    removeElementsByClass("line");    
    var width = document.getElementById("plot1_container").clientWidth, height = document.getElementById("plot1_container").clientHeight;
    let plot1 = document.getElementById('plot1');



    xAxis = data[0].slice(1, -2);
    yAxis = data[index].slice(1, -2);

    numPoints1 = xAxis.length; 
    numAirfoils = data.length-1;

    for (let i = 1; i < numAirfoils; i++){
        var x = document.getElementById("airfoil_selection");
        var option = document.createElement("option");
        option.text = data[i][0].split(".")[0];
        option.value = i;
        x.add(option);
    }
    document.getElementById('airfoil_selection').value = index;

    for (let i = 1; i < numPoints1+1; i++){
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("id", "line"+i.toString());
        line.setAttribute("class", "line");
        line.setAttribute("stroke", "rgb(0,0,255)");
        line.setAttribute("stroke-width", 1);
        plot1.appendChild(line);

        delete line;

    }

    for (let i = 1; i < numPoints1+1; i++){
        let point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        points = convertToPixel(xAxis[i-1], yAxis[i-1], width, height);
        pointx = points[0];
        pointy = points[1];
        point.setAttribute("cx", pointx.toString());
        point.setAttribute("cy", pointy.toString());
        point.setAttribute("r", "2");
        point.setAttribute("fill", "red")
        point.setAttribute("class", "point");
        point.setAttribute("id", "point"+i.toString());
        plot1.appendChild(point);

        delete point;

    }

    drawLine(numPoints1);
    launchXFoil();
}

function init2(){
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


function loadCSV(){
    Papa.parse('static/UIUC.csv', {
        //header: true,
        download: true,
        dynamicTyping: true,
        complete: function(results) {
            data = results.data;
            index = Math.floor(Math.random() * (data.length-1)) + 1;
            init(data, index);
        }
    });
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

function launchXFoil(){
    var width = document.getElementById("plot1_container").clientWidth, height = document.getElementById("plot1_container").clientHeight;
    var x = document.getElementsByClassName("point");
    var ctrlX = "";
    var ctrlY = "";
    for (i = 0; i < x.length; i++) {
        ctrlX = ctrlX + " " + (x[i].getAttribute("cx")/width).toString();
        ctrlY = ctrlY + " " + (0.3-x[i].getAttribute("cy")*0.6/height).toString();
    }

    
    var python = $.ajax({
        url: "/xfoil",
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
            updateCp(data.xcp, data.cp)

        }
    });

}

function updateCp(xcp, cp){

    var margin = {top: 10, right: 10, bottom: 40, left: 50},
    width = 600 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;
    var n = 160;
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


