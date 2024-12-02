import { InfluxDB } from '@influxdata/influxdb-client';
import fs from 'fs';  // Node.js File System module

const url = 'http://mdash.circ.utdallas.edu:8086';
const token = 'CnFz7L8cgPvnYW4n6-3MsaoAuVEMwgGcryKnPO6dcGH5MzASfGMiZqjcJcLo7rWQH144wumPE_rJu42MBt7AiQ==';
const org = 'MINTS';
const bucket = 'SharedAirDFW';

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

const query = `
from(bucket: "${bucket}")
  |> range(start: -30d10m, stop: -30d)
  |> filter(fn: (r) => r["device_name"] == "Indoor IQ Node 01" or r["device_name"] == "Indoor IQ Node 02" or r["device_name"] == "Indoor IQ Node 03" or r["device_name"] == "Indoor IQ Node 04" or r["device_name"] == "Indoor IQ Node 06" or r["device_name"] == "Indoor IQ Node 07" or r["device_name"] == "Indoor IQ Node 08" or r["device_name"] == "Indoor IQ Node 09" or r["device_name"] == "Indoor IQ Node 10" or r["device_name"] == "Indoor IQ Node 11" or r["device_name"] == "Indoor IQ Node 12" or r["device_name"] == "Indoor IQ Node 13" or r["device_name"] == "Indoor IQ Node 14" or r["device_name"] == "Indoor IQ Node 15" or r["device_name"] == "Indoor IQ Node 16" or r["device_name"] == "Indoor IQ Node 17" or r["device_name"] == "Indoor IQ Node 18" or r["device_name"] == "Indoor IQ Node 19" or r["device_name"] == "Indoor IQ Node 20" or r["device_name"] == "Indoor IQ Node 21")
  |> filter(fn: (r) => r["_measurement"] == "D739SENSERTD3")
  |> filter(fn: (r) => r["_field"] == "pm2_5")
  |> map(fn: (r) => ({ r with _value: if r["_value"] > 500. then 0. else r["_value"] }))
  |> last()
`;

const providedUuids = [
  "518e8617-8d03-4d77-90d9-908d2b649b94", "7e4c0e35-fc20-44d4-9349-ededf9799ed4",
  "8dc97338-fbde-4402-a894-e19166feda46", "0ecbd665-3f02-4f81-8ae7-9cbae380ec17",
  "5bbb9f39-8381-46e4-9bc7-51dcc9497853", "27307156-0bd4-4687-b21f-eaa6e7114da7",
  "5e46f67f-713e-4f05-a342-74769f15ef24", "0ef18a64-4eb6-4fb4-8b6c-43fd17663a33",
  "6a10a53b-8bab-472b-8bbc-c668a69aa096", "f76653af-02f0-4366-a1e7-eeaa158a0254",
  "32be2d71-2835-462a-9a3a-1b7c1d305de5", "84c30da3-b2d2-4a61-bdbc-9b6d074b3386",
  "4a675f45-9805-4abb-84b6-d23d62fbefbf", "9557666a-6afe-4083-a2d6-bd964ac62ca0",
  "073fd74f-bce1-4f30-b5da-a2bbd4ad8703", "3fcc54d6-6085-4f0f-be1b-fb351967f7c3",
  "f352d9c4-4bcc-4fb4-8dc5-e03ad6636494", "34adaa65-704d-4c33-9e52-ec4faf9e29f2",
  "1fc236a9-5baa-4338-85c0-5907bc1be5e1", "b50a10f7-6b98-425f-aa23-ba5261eeca70"
];
function fetchData () {
  let output = [];
  let uuidIndex = 0;

  // Query InfluxDB and write output to a file
  queryApi.queryRows(query, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row);
      
      const entry = {
        ts: o._time, // Timestamp from InfluxDB
        value: o._value, //Math.floor(Math.random() * (1500 - 300 + 1)) + 300, // pm2_5 value
        uuid: providedUuids[uuidIndex] // Use the UUID from the provided list
      };
      output.push(entry);
      uuidIndex++;
    },
    error(error) {
      console.error('Error querying InfluxDB:', error);
    },
    complete() {
      // Write the data to an external file (data.json)
      fs.writeFile('src/data/sensorsdata.json', JSON.stringify(output, null, 2), (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('Data written to data.json');
          console.log(output);
        }
      });
    },
  });
}

// Ensure the initial fetch is done immediately
fetchData();

// Set interval to fetch data every 5 minutes (300,000 milliseconds)
//setInterval(fetchData, 300000);