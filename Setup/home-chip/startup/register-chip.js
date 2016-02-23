var fs = require('fs');

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
//
// register-chip.js
//
// This is run at startup so that the CHIP announces itself
// and its properties to the Central Web site, allowing
// easier discovery, and management (especially in terms of
// the DHCP-allocated IP address - registration makes it easier
// to find their device on the network) 
//
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var URL_REGISTRATION = "https://pdrn4jxala.execute-api.us-east-1.amazonaws.com/prod/appliance/";

//
// Read the Bluetooth details adnd CHIP name from the filesystem
//
var ble_address     = fs.readFileSync("/etc/bluetooth_address", "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var ble_uuid        = fs.readFileSync("/etc/bluetooth_uuid",    "utf8").toString().trim().replace(/[\:]/g,"").toLowerCase();
var chip_name       = fs.readFileSync("/etc/chip_name",         "utf8").toString().trim().replace(/[\:]/g,"");

console.log("Registering this Edison -> " + ble_address);
console.log("to this URL endpoint: " + URL_REGISTRATION + ble_address);

var request = require('request');
var params = 
{
    "detail" : 
    {
        name:                                         chip_name,
        ipAddress:                                    getLocalIPs()['wlan0'].IPv4,
        applianceType:                                1024,
        bluetoothUUID:                                ble_uuid
    }              		
};

request.put(
{
    url: URL_REGISTRATION + ble_address,
    json: params
},
function(err, httpResponse, body)
{
    if ( err )
    {
        console.log("ERROR: " + err);
    }
    else
    {
        console.log("httpResponse => " + httpResponse);
        console.log(body);
    }
});
    
        

function getLocalIPs()
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

