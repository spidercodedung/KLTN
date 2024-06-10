const sheetURL = 'https://script.google.com/macros/s/AKfycbzpMocJYnEdz8_bqZA1Badm-73dCxQsVGtMd2Pz19wRPvK69eXKePmIiKIZTKHfay4/exec';
// Map initialization 
var map = L.map('map').setView([16.16666666, 107.83333333], 8);

//osm layer
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});osm.addTo(map);
var marker, circle;
var polyline;
var markersLayer = L.layerGroup().addTo(map);
var markerCount = 1; // Biến đếm marker
var circleCount = 1; // Biến đếm circle marker
var previousMarkerPositions = [];
var circlePositions = [];
var currentPopup; // Biến để lưu trữ popup hiện tại
var lastMarkerPosition = null; // Biến để lưu vị trí đã zoom gần nhất

function fetchDataFromThingSpeak() {                                                
$.getJSON("https://api.thingspeak.com/channels/2472765/fields/1/last.json?api_key=S8KSV0BX9R9FA5V4", function(result1) {
    var lat = Number(result1.field1);
    
    $.getJSON("https://api.thingspeak.com/channels/2472765/fields/2/last.json?api_key=S8KSV0BX9R9FA5V4", function(result2) {
        var long = Number(result2.field2);
        $.getJSON("https://api.thingspeak.com/channels/2169158/fields/1/last.json?api_key=SLEEWW449CMWYSDI", function(result3){
            var temperature = Number(result3.field1);

            var temperatureElement = document.getElementById('temperatureValue');
            if(temperatureElement){
                temperatureElement.textContent= temperature + '°C' ;
            }else{
                console.error('Temperature element not found.');
            }
            $.getJSON("https://api.thingspeak.com/channels/2169158/fields/6/last.json?api_key=SLEEWW449CMWYSDI", function(result6){
                var setupTem = Number(result6.field6);
                var tempSetupElement = document.getElementById('temSetup');
                if(tempSetupElement){
                    tempSetupElement.textContent= setupTem + '°C' ;
                }else{
                    console.error('TempSetup element not found.');
                }
                $.getJSON("https://api.thingspeak.com/channels/2169158/fields/4/last.json?api_key=SLEEWW449CMWYSDI", function(result4){
                    var time = Number(result4.field4);
                    $.getJSON("https://api.thingspeak.com/channels/2169158/fields/5/last.json?api_key=SLEEWW449CMWYSDI", function(result5){
                        var date = Number(result5.field5);
                        
                        var hour= Math.floor(time/10000);
                        var min = Math.floor((time/100)%100);
                        var sec = time % 100;

                        var day= Math.floor(date/10000);
                        var mon = Math.floor((date/100)%100)-1;
                        var yr = 2000 + date % 100;

                        var now = new Date();

                        var currentHours = String(now.getHours()).padStart(2,"0");
                        var currentMinutes = String(now.getMinutes()).padStart(2,"0");

                        const timeString = `${currentHours}:${currentMinutes}`;

                        var currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
                        var fetchedDate = new Date(yr, mon, day, hour, min, sec);
                        var diffInMinutes = (currentDate - fetchedDate) / 60000;

                        if (diffInMinutes > 3) {
                            document.getElementById("checkdata").innerHTML = 'NO DATA';
                        }
                        else{
                            document.getElementById("checkdata").innerHTML = timeString;
                            setInterval(postDataToSheet(`${day}/${mon+1}/${yr}`, `${hour}:${min}:${sec}`, lat, long, `${temperature}°C`, `${setupTem}°C`), 1000);
                        }

                        if (!isNaN(lat) && !isNaN(long)&&!isNaN(time)&&!isNaN(date)) {
                        createMarker(lat, long, hour + ":" + min + ":" + sec, day + "/" + mon + "/" + yr);
                        } else {
                            console.error('Invalid latitude or longitude:', lat, long, time, date);
                        }

                        }).fail(function(jqXHR,textStatus,errorThrown){
                            console.error('Faile to fetch data from ThingSpeak for field5:',textStatus,errorThrown)
                        });
                    }).fail(function(jqXHR,textStatus,errorThrown){
                        console.error('Faile to fetch data from ThingSpeak for field4:',textStatus,errorThrown)
                    });
                }).fail(function(jqXHR,textStatus,errorThrown){
                    console.error('Faile to fetch data from ThingSpeak for field3:',textStatus,errorThrown)
                });

            }).fail(function(jqXHR,textStatus,errorThrown){
                console.error('Faile to fetch data from ThingSpeak for field3:',textStatus,errorThrown)
            });
        
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to fetch data from ThingSpeak for field2:', textStatus, errorThrown);
        });
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Failed to fetch data from ThingSpeak for field1:', textStatus, errorThrown);
    });
}


function postDataToSheet(date,time, lat, long, temperature,Temsetup ) {
    const formData = new FormData();
    formData.append('Date', date);
    formData.append('Time', time);
    formData.append('Latitude',  lat.toString());
    formData.append('Longitude', long.toString());
    formData.append('Temperature', temperature.toString());
    formData.append('Temsetup', Temsetup.toString());

    fetch(sheetURL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Server error: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371000; // Bán kính Trái Đất tính bằng mét
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1); 
    var a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var distance = R * c; // Khoảng cách tính bằng mét
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
function createMarker(lat, long, time, date) {
    if (marker) {
        var currentLat = marker.getLatLng().lat;
        var currentLong = marker.getLatLng().lng;

        // Tính khoảng cách giữa vị trí cũ và vị trí mới
        var distance = getDistanceFromLatLonInMeters(currentLat, currentLong, lat, long);

        // Chỉ tạo marker mới nếu khoảng cách lớn hơn 5 mét
        if (distance < 10) {
            console.log('Distance is less than 5 meters. No new marker created.');
            return;
        }
    }
    if (marker) {
        map.removeLayer(marker);
    }
    if (circle) {
        map.removeLayer(circle);
    }
    marker = L.marker([lat, long]);
    circle = L.circle([lat, long], { radius: 20 });
    var featureGroup = L.featureGroup([marker, circle]).addTo(map);

    if (!CircleExist(lat, long)) {
        // Nếu không có circle marker, tạo một circle marker mới và đánh số lên đó
        var circleMarker = L.circleMarker([lat, long], { radius: 8, color: 'blue', fillOpacity: 1, fillColor: 'blue' }).addTo(map);
        circleMarker.bindTooltip(circleCount.toString(), {
            permanent: true,
            direction: 'center',
            opacity: 1,
            className: "layer_marker", 
        });

       // Bắt sự kiện click trên circle marker
       circleMarker.on('click', function(e) {
        // Nếu có popup đang hiển thị, đóng nó đi trước khi mở popup mới
        if (currentPopup) {
            currentPopup.remove();
        }
        // Tạo nội dung popup chứa thông tin vị trí
        var popupContent = "Lat: " + lat + "<br>Long: " + long + "<br>Time:" + time + "<br>Date:" + date;
        // Tạo popup và mở nó
        currentPopup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);

    });
        circlePositions.push({lat: lat, long: long}); // Thêm vị trí mới vào mảng circlePositions
        circleCount++; // Tăng biến đếm lên cho circle marker tiếp theo
        
    }
    previousMarkerPositions.push([lat, long]);

    if (previousMarkerPositions.length > 0) {
        polyline = L.polyline(previousMarkerPositions.concat([[lat, long]]), { color: 'blue', dashArray: '10,10' }).addTo(map);
        featureGroup.addLayer(polyline);
    }

    previousMarkerPositions.push([lat, long]);
    if (previousMarkerPositions.length > 100) {
        previousMarkerPositions.shift();
    }
    lastMarkerPosition = { lat: lat, lng: long };

    map.fitBounds(featureGroup.getBounds());
    console.log('Data from ThingSpeak:', lat, long);
    console.log('Time from ThingSpeak:',time);
    console.log('Time from ThingSpeak:',date);
}


function CircleExist(lat, long) {
    // Kiểm tra xem circle marker đã tồn tại tại vị trí này hay không
    for (var i = 0; i < circlePositions.length; i++) {
        var pos = circlePositions[i];
        if (pos.lat === lat && pos.long === long) {
            return true;
        }
    }
    return false;
}
// Bắt sự kiện popup được đóng để loại bỏ popup hiện tại
map.on('popupclose', function(e) {
    currentPopup = null;
});
fetchDataFromThingSpeak();
setInterval(fetchDataFromThingSpeak, 10000);


var getCurrentLocationBtn = document.getElementById('Zoom');
// Gắn sự kiện click cho nút
getCurrentLocationBtn.addEventListener('click', zoomToLastMarker);

function zoomToLastMarker() {
    if (lastMarkerPosition) {
        map.setView([lastMarkerPosition.lat, lastMarkerPosition.lng], 20);
        console.log("Zooming to the last marker position:", lastMarkerPosition);
    } else {
        console.log("No marker available to zoom to.");
    }
}