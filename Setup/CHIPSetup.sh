#!/bin/sh

echo "////////////////////////////////////////////////////////////"
echo "//"
echo "// CHIP registration setup"
echo "//"
echo "////////////////////////////////////////////////////////////"
echo
echo "Please enter a name for your CHIP:"
read chip_name
echo

mkdir /home/chip/startup
cp home-chip/startup/* /home/chip/startup/.
pushd /home/chip/startup 
npm install
popd
ls /var/lib/bluetooth/ > /etc/bluetooth_address
echo "badd4fed498b4e1baf53950516d10305" > /etc/bluetooth_uuid
echo "$chip_name" > /etc/chip_name

cp lib-systemd-system/chip-register.service /lib/systemd/system
systemctl enable chip-register.service
systemctl start chip-register.service



