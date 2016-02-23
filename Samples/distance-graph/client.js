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
var fs                    = require('fs');

//
// Read the Bluetooth details and CHIP name from the filesystem
//
var ble_address     = fs.readFileSync("/etc/bluetooth_address", "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var ble_uuid        = fs.readFileSync("/etc/bluetooth_uuid",    "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var chip_name       = fs.readFileSync("/etc/chip_name",         "utf8").toString().trim().replace(/[\:]/g,"");

function main()
{
  noble.on('stateChange', onNobleStateChange); 
}

function onNobleWarning(message)
{
  console.log("ERROR: " + message);
}

function onNobleStateChange(state)
{
  if ( state == "poweredOn" )
  {    
    bleno.startAdvertising( chip_name, [ble_uuid] );

    console.log("");
    console.log("");
    console.log("");
    console.log("****************************************");
    console.log("**");    
    console.log("** Distance Graph - Client");
    console.log("**");
    console.log("** Version 2.0 [OCT15]");
    console.log("** Adam Larter, SA, Melbourne, Australia");
    console.log("**");
    console.log("** Software not for public consumption!");
    console.log("**");
    console.log("** Now advertising as " + chip_name);
    console.log("** to UUID '" + ble_uuid + "'");
    console.log("**");
    console.log("****************************************");
    console.log("");
    console.log("");
  } 
  else
  {
    console.log("onNobleStateChange -> " + state);
  } 
}

function onNobleScanningResult(error)
{
  if ( error != null )
    console.log("onNobleScanningResult -> " );
}

main();