console.log('Hello from phantom');

var fs = require('fs'),
    page = require('webpage').create();

var url = 'file://' + fs.absolute('./raphael.html');

var svgDrawer = function() {
    var svgContainer = document.getElementById("svg");

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("div").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data.tsv", function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {
            d.sepalLength = +d.sepalLength;
            d.sepalWidth = +d.sepalWidth;
        });

        x.domain(d3.extent(data, function (d) {
            return d.sepalWidth;
        })).nice();
        y.domain(d3.extent(data, function (d) {
            return d.sepalLength;
        })).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Sepal Width (cm)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Sepal Length (cm)")

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function (d) {
                return x(d.sepalWidth);
            })
            .attr("cy", function (d) {
                return y(d.sepalLength);
            })
            .style("fill", function (d) {
                return color(d.species);
            });

        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d;
            });

    });

    //return svg;
};

page.onResourceTimeout = function(request) {
    console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
};

page.open(url, function (status) {
    //page.injectJs("scatterInjectTest.js");
    page.evaluate(svgDrawer);
    page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function() {
        // jQuery is loaded, now manipulate the DOM
    });

    var svg = document.getElementById("svg");

    window.setTimeout(function () {
        console.log(page.content);
        //page.viewportSize = { width: 930, height: 1020 };
        //page.render('thing.png');
        phantom.exit();
    }, 10000);

    var content = page.content;
    //console.log(content);
    //console.log(page.renderBase64(imageFormat));
    //page.render("saved/test.pdf");
    //phantom.exit();
});

//phantom.exit(); // Originally from the phantom lambda template