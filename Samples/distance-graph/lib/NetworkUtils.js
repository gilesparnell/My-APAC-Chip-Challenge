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
var os = require("os");

function NetworkUtils()
{
        
}

NetworkUtils.prototype.getHostName = function()
{
    return os.hostname();
}

NetworkUtils.prototype.getWLAN0IPAddress = function()
{
    return this.getLocalIPs()['wlan0'].IPv4;
}

NetworkUtils.prototype.getLocalIPs = function()
{
    /**
     * Collects information about the local IPv4/IPv6 addresses of
     * every network interface on the local computer.
     * Returns an object with the network interface name as the first-level key and
     * "IPv4" or "IPv6" as the second-level key.
     * For example you can use getLocalIPs().eth0.IPv6 to get the IPv6 address
     * (as string) of eth0
     */
    var addrInfo, ifaceDetails, _len;
    var localIPInfo = {};
    //Get the network interfaces
    var networkInterfaces = require('os').networkInterfaces();
    //Iterate over the network interfaces
    for (var ifaceName in networkInterfaces) {
        ifaceDetails = networkInterfaces[ifaceName];
        //Iterate over all interface details
        for (var _i = 0, _len = ifaceDetails.length; _i < _len; _i++) {
            addrInfo = ifaceDetails[_i];
            if (addrInfo.family === 'IPv4') {
                //Extract the IPv4 address
                if (!localIPInfo[ifaceName]) {
                    localIPInfo[ifaceName] = {};
                }
                localIPInfo[ifaceName].IPv4 = addrInfo.address;
            } else if (addrInfo.family === 'IPv6') {
                //Extract the IPv6 address
                if (!localIPInfo[ifaceName]) {
                    localIPInfo[ifaceName] = {};
                }
                localIPInfo[ifaceName].IPv6 = addrInfo.address;
            }
        }
    }
    return localIPInfo;
};

NetworkUtils.prototype.getLocalBLEMACAddress = function()
{
    require('fs').readFile(
        "/etc/bluetooth_address",
        "utf8", 
        function(err, data) 
        {
          if (err) throw err;
                    
          NetworkUtils.prototype.BLE_MAC_ADDRESS = data.trim().replace(/[\:]/g,"").toLowerCase();
          
        });
}


module.exports = new NetworkUtils();
module.exports.getLocalBLEMACAddress();