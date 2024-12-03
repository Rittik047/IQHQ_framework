---
title: IQ Indoor Map
---

```js

 // Add sensor data here
const sensorsData = await FileAttachment("data/sensorsdata.json").json();

//const exampleData = await FileAttachment("data/testdata.json").json();

// Add sensor metadata here
const sensors = await FileAttachment("data/sensors.json").json();
const container = html`<div id="smplr-container" style='
  height: 900px; 
  width: 80%; 
  margin: auto; 
  border-radius: 20px; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background-color: #ffffff; 
  overflow: hidden; 
  position: relative;' />`;
const elevation = 2.25;//Inputs.range([0, 3], {label: "Elevation (grid & sphere)", step: 0.25, value: 2.75});
const gridFill = 1; //Inputs.range([0.5, 1.5], {label: "Fill factor", step: 0.1});
const style =  "bar-chart";//Inputs.radio(["bar-chart", "grid", "spheres"], {label: "Heatmap style", value: "bar-chart"});

const belt = await import("https://cdn.jsdelivr.net/npm/@mobily/ts-belt@latest/+esm");
const smplrspace = await import("https://cdn.jsdelivr.net/npm/@smplrspace/smplr-loader@latest/+esm");
const smplr = await smplrspace.loadSmplrJs('esm');

const mappedSensorsData = sensorsData
  .map((d) => {
    const sensor = sensors.find((s) => s.id === d.uuid);
    if (!sensor) {
      return null;
    }
    return { ...d, position: sensor.position };
  })
  .filter((d) => belt.G.isNotNullable(d));

// Calculate the color domain dynamically
const minValue = Math.min(...mappedSensorsData.map((d) => d.value));
const maxValue = Math.max(...mappedSensorsData.map((d) => d.value));
// Create the legend container after calculating min and max values
const legendContainer = html`<div style='
  position: absolute; 
  right: 10px; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 40px; 
  height: 300px; 
  display: flex; 
  flex-direction: column; 
  align-items: center;'>
  <span style="font-size: 12px; margin-bottom: 5px;">${maxValue}</span>
  <div id="color-scale" style="width: 100%; height: 100%; background: linear-gradient(to bottom, red, yellow, green);"></div>
  <span style="font-size: 12px; margin-top: 5px;">${minValue}</span>
  </div>
</div>`;


const space = new smplr.Space({
  spaceId: '678f175a-02e0-4228-a15e-3d87f767f585',
  clientToken: 'pub_0aa5a7a87a7d46629076fe3a34bdaf1d',
  containerId: 'smplr-container',
});

//console.log(mappedSensorsData);

const viewerReady = (async () => {
  await space.startViewer({
    preview: false,
    allowModeChange: true,
    renderOptions: {
      backgroundColor: '#F3F6F8',
    },
    cameraPlacement: {
      alpha: Math.PI / 2 ,
      beta:0,
      radius: 15,
      target: {
        x: 40,
        y: 40,
        z: -25
      }
    },
    //autoRotate: true, // Enable automatic rotation
    onError: (error) => console.error('Could not start viewer', error),
    onReady: () => {
      console.log('Viewer is ready');
      // Add the data layer here after the viewer is ready
      //space.startAutoRotation(0.2);
      space.addDataLayer({
        id: 'hm',
        type: 'heatmap',
        style: style,
        data: mappedSensorsData,
        value: (d) => d.value,
        color: smplr.Color.numericScale({
          name: smplr.Color.NumericScale.RdYlGn,
          domain: [minValue, maxValue], // Use dynamic min and max
          invert: true,
        }),
        height: (v) => 5*(v - minValue) / (maxValue - minValue), // Normalize height to dynamic range
        confidenceRadius: 15,
        gridSize: 0.4,
        gridFill: gridFill,
        elevation: elevation,
      
      });
      
    },
  });
})();

await viewerReady; // Ensure viewer initialization completes
// Add the legend container to the DOM

// Function to refresh the page every 5 seconds
setInterval(() => {

  window.location.reload(); // Reloads the page every 5 seconds
}, 300000); // 5000 ms = 5 seconds

```

<div style="height: 90%; width: 113%;">
  <div id="smplr-container" style='
  height: 700px; 
  width: 80%; 
  margin: auto; 
  border-radius: 20px; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background-color: #ffffff; 
  overflow: hidden;'></div>
</div>
<div style='
  position: absolute; 
  right: 50px; 
  top: 50%; 
  transform: translateY(-50%); 
  width: 50px; 
  height: 350px; 
  display: flex; 
  flex-direction: column; 
  align-items: center;'>
  <span style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">PM 2.5</span>
  <span style="font-size: 12px; margin-bottom: 5px;">${maxValue} µg/m<sup>3</sup></span>
  <div id="color-scale" style="width: 100%; height: 100%; background: linear-gradient(to bottom, red, yellow, green);"></div>
  <span style="font-size: 12px; margin-top: 5px;">${minValue} µg/m<sup>3</sup></span>
</div>
