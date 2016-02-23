/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 *
 * Author: Adam Larter, Solutions Architect, AWS
 * Created: February, 2016
 * 
 * For internal Amazon purposes only! Not for distribution.
 * Contact author for more details
 * 
 */
var bleno                 = require("bleno");
var noble                 = require('noble');
var mqtt                  = require('mqtt');
var mqttClient            = null; 
var bleadv                = require("./lib/bleadv");
var networkutils          = require("./lib/NetworkUtils");
var detection             = require("./lib/detection_container")
var app                   = require('express')(); //Express Library
var server                = require('http').Server(app); //Create HTTP instance
var io                    = require('socket.io')(server); //Socket.IO Librar
var fs                    = require('fs');
var iosocket              = null;
var MAX_SAMPLES_TO_KEEP   = 100;
var arrayDetections       = new Array();
var timeLastReported      = new Date();
var reportingFrequency    = 1000;
var MQTT_TOPIC            = "chip";
var HTTP_PORT             = 3000;

//
// Read the Bluetooth details and device name from the filesystem
//
var ble_address     = fs.readFileSync("/etc/bluetooth_address", "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var ble_uuid        = fs.readFileSync("/etc/bluetooth_uuid",    "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var chip_name       = fs.readFileSync("/etc/chip_name",         "utf8").toString().trim().replace(/[\:]/g,"");
            
function publishRecordToMQTTTopic(payload)
{
    try
    {
      if ( iosocket != null )
      {
        iosocket.broadcast.emit('message', JSON.stringify(payload));
      }
      
      // Send via MQTT
      mqttClient.publish(MQTT_TOPIC, payload);
    }
    catch(ex)
    {
      console.log("EXCEPTION:: publishRecordToMQTTTopic() -> " + ex.message);
    }
}

function main()
{  
  console.log("");
  console.log("");
  console.log("");
  console.log("**********************************************************");
  console.log("**");    
  console.log("** Distance Graph - Server");
  console.log("**");
  console.log("** Version 3.0 [FEB16]");
  console.log("** Adam Larter, SA, Melbourne, Australia");
  console.log("**");
  console.log("** Software not for public consumption!");
  console.log("**");
  console.log("** Listening to BLE UUID:"); 
  console.log("** '" + ble_uuid + "'");
  console.log("**");
  console.log("** Publishing to MQTT topic: " + MQTT_TOPIC );
  console.log("** HTTP and Socket server on port: " + HTTP_PORT + " on " + networkutils.getLocalIPs()['wlan0'].IPv4);
  console.log("**");
  console.log("**********************************************************");
  console.log("");
  console.log("");

  noble.on('stateChange', onNobleStateChange); 
  noble.on('discover',    onNobleDiscoverPeripheral);
  noble.on('warning',     onNobleWarning);
  
  //
  // If someone requests the root of the website, server the default page (graphs and cleverness)
  //
  app.get('/', function (req, res) {                  
      res.sendFile(__dirname + '/www/index.html'); //serve the static html file
  });                
  
  app.use(require('express').static('www'));                                 
                    

  io.on('connection', function(socket)
    {
      if ( iosocket == null )
      {
        iosocket = socket;  
      }
      
      socket.on('someInboundCommandWithData', function(data)
        {
           //on incoming websocket message...
           console.log(data);
        });
  });                                                   
  
  server.listen(HTTP_PORT);   
}

function onNobleWarning(message)
{
  console.log("ERROR: " + message);
}

function onNobleDiscoverPeripheral(peripheral)
{  
  if ( peripheral.rssi != 0 && peripheral.rssi > -80 )
  {
    var thisAdvertisement = new bleadv(new Date(), peripheral.advertisement.localName, peripheral.uuid, peripheral.rssi);
    
    if ( arrayDetections[peripheral.uuid] == null )
    {
      //
      // This is the first time we have seen this device
      //
  
      console.log("New Device discovered: " + peripheral.uuid + " @ " + peripheral.rssi + "dBm");
      
      arrayDetections[peripheral.uuid] = new detection(peripheral.uuid, peripheral.advertisement.localName, chip_name);
      arrayDetections[peripheral.uuid].arrayDetections.push( thisAdvertisement );
      arrayDetections[peripheral.uuid].arrayDetections.push( thisAdvertisement );
    }
    else
    {
      //
      // This is an RSSI update for this beacon
      //
      arrayDetections[peripheral.uuid].arrayDetections.push( thisAdvertisement );
      arrayDetections[peripheral.uuid].name = peripheral.advertisement.localName;
      
      //
      // Update the timestamp
      //
      arrayDetections[peripheral.uuid].lastDetectionTimestamp = new Date();
      
      //
      // Remove entries from the head of the array if there are too many items
      //
      var maxLoop = arrayDetections[peripheral.uuid].arrayDetections.length - MAX_SAMPLES_TO_KEEP;
      for (var loop = 0; loop < maxLoop; loop++) 
      {
          arrayDetections[peripheral.uuid].arrayDetections.shift();
      }
      
      //
      // Sort, Smooth and Predict using (a rather aggressive!) Kalman filer
      //           
      arrayDetections.sort(compareDetectionTimestampsForSorting);
      arrayDetections[peripheral.uuid].PredictUsingKalman();
      
      //
      // Now calculate distance
      //
      arrayDetections[peripheral.uuid].CalculateDistance();
  
      //console.log("Update: " + peripheral.uuid + "(" + peripheral.advertisement.localName + ") = " + arrayDetections[peripheral.uuid].rssi + " >> " + arrayDetections[peripheral.uuid].filteredRSSI.toFixed(3) + " = " + arrayDetections[peripheral.uuid].calculatedDistance.toFixed(2));
      
    }
    
    //
    // Create a new array with just the top-level data from our time-series array (so, no time series data)
    //
    var arrayPayload = new Array();
    for ( var storeDetection in arrayDetections )
    {
        arrayPayload.push(arrayDetections[storeDetection].CloneWithoutDetections());
    }
    
    var dateTimeNow = new Date();
    if ( timeLastReported.getTime() + reportingFrequency < dateTimeNow.getTime() )
    {
      var strPayload = JSON.stringify(arrayPayload);    
      publishRecordToMQTTTopic(strPayload);
    
      for ( storeDetection in arrayDetections )
      {
          console.log(arrayDetections[storeDetection].uuid + " :: " + arrayDetections[storeDetection].filteredRSSI + " dBm >> " + arrayDetections[storeDetection].calculatedDistance + " metres away");
      }
      
      timeLastReported = dateTimeNow;
    }
  }
}

function onNobleStateChange(state)
{
  if ( state == "poweredOn" )
  { 
    //
    // Setup MQTT - subscribe to local
    //
    mqttClient = mqtt.connect("mqtt://localhost");            
    noble.startScanning([ble_uuid], true, onNobleScanningResult);
  } 
  else
  {
    console.log("onNobleStateChange -> " + state);
  } 
}

function onNobleScanningResult(error)
{
  if ( error != null )
    console.log("ERROR:: onNobleScanningResult() -> " );
}

function compareDetectionTimestampsForSorting(a, b) 
{
    var aTimestamp = Date.parse(a.timestamp);
    var bTimestamp = Date.parse(b.timestamp);
    return aTimestamp - bTimestamp;
}


main();