import '../styles/style.scss'
import { 
    max,
    scaleLinear,
    mouse,
    event,       

    select, 
    scaleTime,
    axisBottom,
    axisLeft} from 'd3';

const gdpDataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
const svgCanvas = {width: 900, height: 600};
const chartPadding = {top: 70, right: 60, bottom: 40 ,left: 70, bar: .9};
const innerWidth = svgCanvas.width - chartPadding.right  - chartPadding.left;
const innerHeight = svgCanvas.height - chartPadding.top - chartPadding.bottom;


fetch(gdpDataURL)
        .then(response => response.json())
        .then(rawData => {
                const gdpData = rawData.data;
                const minDate = new Date(gdpData[0][0]);
                const maxDate = new Date(gdpData[gdpData.length - 1][0]);


                // PROCESS DATA FOR tooltip OUTPUT
                const processData = (function() {
                        let yearPlaceHolder, quarter = 1;
                        const yearDateQuarter = gdpData.map(e => {
                                let year = e[0].slice(0,4)
                                const gdp = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                                                        .format(e[1])
                                                        .replace(/0$/,' Billion')

                                if ( year === yearPlaceHolder ) {
                                        quarter += 1;
                                        
                                        if (quarter > 4) {
                                                quarter = 1;
                                        };
                                        return [ e[0], e[1], year + ` Q${quarter}`, gdp ]

                                } else {
                                        yearPlaceHolder = year;
                                        quarter = 1
                                        return [ e[0], e[1], year + ` Q${quarter}`, gdp ] 
                                }                        
                                })                             
                                return { processedData: yearDateQuarter };                
                })();
                const data = processData.processedData


                // X AND Y AXES
                const yScale = scaleLinear()
                                .domain([0, max(data, (d,i,a) => a[i][1])])
                                .range([innerHeight,0])            
                const yAxisGenerator = axisLeft(yScale)


                const xScale = scaleTime()
                                .domain([minDate, maxDate])
                                .range([0, innerWidth])            
                const xAxisGenerator = axisBottom(xScale)

                        
                const svg = select('#chart-container')
                        .append('svg')
                        .attr('width', svgCanvas.width)
                        .attr('height', svgCanvas.height) 
                
                const chartTitle = svg.append('text')
                                        .text('United States GDP\n (1940\'s To 2015)')
                                        .attr('transform', 'translate(120,40)')
                                        .attr('id', 'title')
                
                const chartGroup = svg.append('g')
                                        .attr('transform', `translate(${chartPadding.left}, ${chartPadding.top})`)
                                        .attr('id', 'chart-group')
                // yAxis
                chartGroup.append('g')
                                .call(yAxisGenerator)
                                .attr('transform', `translate(0,0)`)
                                .attr('id', 'y-axis')
                                .append('text')
                                .attr('class', 'side-title-gdp')
                                .attr('transform', 'translate(25,100) rotate(-90)')
                                .text('Gross Domestic Product') 
                
                // xAxis
                chartGroup.append('g')
                        .attr('transform', `translate(0, ${innerHeight})`)
                        .attr('id', 'x-axis')
                        .call(xAxisGenerator);

 
                const toolTip = select("body")
                                .append("div")
                                .style("position", "absolute")
                                .style("z-index", "10")
                                .attr('class', 'div-tool-tip')
                                .style('visibility', 'hidden')
                                                            
                chartGroup.selectAll('rect')
                        .data(data)
                        .enter()
                        .append('rect')
                        .attr('data-date', function(d){ return d[0]})
                        .attr('data-gdp', function(d){ return d[1]})
                        .attr('x',function(d){ return xScale(new Date(d[0]) )})
                        .attr('width', svgCanvas.width / gdpData.length )
                        .attr('height', function(d){ return  innerHeight - yScale(d[1]) })
                        .attr('y',function(d){ return yScale(d[1]) })
                        .attr('class', 'bar')
                        .on('mouseover', function(d){
                                toolTip.attr('id', 'tooltip')
                                       .attr('data-date', d[0]) 
                                       .style('display', null)                                      
                                       .transition()
                                       .delay(50)
                                       .style('visibility', 'visible')
                                       .style('opacity',10)
                                       .duration(1000)	
                        })
                        .on('mousemove', function(d){
                                toolTip.html(d[2] + '<br/>' + d[3])	
                                       .style("left", (event.pageX + 10) + "px")		
                                       .style("top", (event.pageY - 100) + "px")
                        })	
                        .on('mouseout', function(d){
                                toolTip.style('display', 'none')
                                        .transition()
                                        .delay(50)
                                        .style('visibility', 'hidden')
                                        .style('opacity',10)
                                        .duration(1000)	
                         })


        });
