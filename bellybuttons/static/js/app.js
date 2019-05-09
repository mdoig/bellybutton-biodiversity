async function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    const url = `/metadata/${sample}`

    // Use d3 to select the panel with id of `#sample-metadata`
    const panel = d3.select('#sample-metadata')

    // Use `.html("") to clear any existing metadata
    panel.html('')

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    const metadata = await d3.json(url)

    const entries = Object.entries(metadata)

    console.log(entries)

    // BONUS: Build the Gauge Chart
    const level = metadata.WFREQ

    // Trig to calc meter point
    const degrees = 180 - (level * 20),
        radius = .5
    const radians = degrees * Math.PI / 180
    const x = radius * Math.cos(radians)
    const y = radius * Math.sin(radians)

    // Path: may have to change to create a better triangle
    const mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z'
    const path = mainPath.concat(pathX,space,pathY,pathEnd)

    const gauge_data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 14, color:'850000'},
        showlegend: false,
        name: 'scrubs',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6',
                '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(80, 100, 11, .5)',
                            'rgba(110, 154, 22, .5)', 'rgba(140, 180, 33, .5)', 
                            'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                            'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)', 
                            'rgba(245, 240, 214, .5)', 
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6',
      '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }]

    const gauge_layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per week',
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    }

    return entries.forEach((e) => {
      let line = panel.append('p')
        line.text(`${e[0]}: ${e[1]}`)
      }
    ), Plotly.newPlot('gauge', gauge_data, gauge_layout)

}

async function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
    const url = `/samples/${sample}`

    const sample_data = await d3.json(url)

    // @TODO: Build a Bubble Chart using the sample data
    const bubble_data = [{
      x : sample_data.otu_ids,
      y : sample_data.sample_values,
      mode : 'markers',
      marker : {
        size : sample_data.sample_values,
        color : sample_data.otu_ids
      },
      text : sample_data.otu_labels
    }]

    const bubble_layout = {
      xaxis : {
        title : 'OTU ID'
      }
    }
    


    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    const pie_data = [{
      values : sample_data.sample_values.slice(0, 10),
      labels : sample_data.otu_ids.slice(0, 10),
      hovertext : sample_data.otu_labels.slice(0, 10),
      type : 'pie'
    }]

    const pie_layout = {
      height : 500,
      width : 500
    }

    console.log(sample_data)

    return Plotly.newPlot('bubble', bubble_data, bubble_layout), Plotly.newPlot('pie', pie_data, pie_layout)

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
