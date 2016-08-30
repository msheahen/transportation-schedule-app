function getJSON(t){return fetch(t).then(function(t){return t.json()})["catch"](function(t){return Promise.reject(err)})}function convertUnixTime(t){var e=new Date(1e3*t),n=e.getHours();n>=13?(amPm="PM",n-=12):amPm="AM";var i="0"+e.getMinutes();"0"+e.getSeconds();return n+":"+i.substr(-2)+" "+amPm}function displayMessage(t,e,n,i,o){$("#toast-text").html(t),null===e?$("#toast_action").css({display:"none"}):($("#toast_action").css({display:"block"}),$("#toast_action").html(e)),$("#toast").show("slow"),$("#toast_action").click(function(){i(o),$("#toast").hide("slow")}),$("#toast_dismiss").click(function(){$("#toast").hide("slow")})}function createTripCard(t,e,n){var i=t.trip_id,o=(t.trip_name,!1),r=!1,s=!1,a=!1,c=new Date;c=c.getTime()/1e3;var d="<div class='prediction onTime'> ON TIME</div>";if(t.stop.forEach(function(t){t.stop_id==e&&(o=t),t.stop_id==n&&(r=t)}),!o||!r)return 0;var p=(r.sch_arr_dt-o.sch_arr_dt)/60,l="http://realtime.mbta.com/developer/api/v2/predictionsbytrip?api_key="+apikey+"&trip="+i+"&format=json";getJSON(l).then(function(t){if(!t.error&&(t.stop.forEach(function(t){t.stop_id==e&&(s=t),t.stop_id==n&&(a=t)}),(a.pre_dt-r.sch_arr_dt)/60>=1||(s.pre_dt-o.sch_arr_dt)/60>=1)){var c=Math.min(a.pre_dt-r.sch_arr_dt,s.pre_dt-o.sch_arr_dt);d="<div class='prediction late'> DELAYED "+c+" MINUTES</div>"}var l="<div class='card'>"+d+"<div class='duration'>Duration: <b>"+p+" minutes </b></div><br/><div class='depart'>Departs from "+o.stop_name+" at <b>"+convertUnixTime(o.sch_arr_dt)+"</b></div><div class='stops-link'>"+(r.stop_sequence-o.stop_sequence-1)+" stops in between</div><div class='arrive'>Arrives in "+r.stop_name+" at <b>"+convertUnixTime(r.sch_arr_dt)+"</b></div></div>";$("#trip-options").append(l);var u=$("#train-line").val(),h={route_id:u,trip_start:e,trip_end:n,trip_id:i,tripCard:l},v=openDatabase();v.then(function(t){var e=t.transaction("trips","readwrite"),n=e.objectStore("trips");return n.put(h),e.complete})["catch"](function(t){console.log(t)})})["catch"](function(t){displayMessage(t,null,"dismiss")})}function getTrips(t,e,n,i){var o="&route="+t+"&max_trips=100&max_time=1440&direction="+i,r="http://realtime.mbta.com/developer/api/v2/schedulebyroute?api_key="+apikey+o+"&format=json";getJSON(r).then(function(t){return t.direction[0].trip})["catch"](function(t){displayMessage("Uh oh!  We were unable to retreive your trip from the api.  Want to see your last saved trip?","Yes!","dismiss",Controller.showSavedSearch),$("#load").css({display:"none"})}).then(function(t){t?(console.log(t),Controller.db.then(function(t){var e=t.transaction("trips","readwrite"),n=e.objectStore("trips");n.clear()})):reject(),$("#load").css({display:"none"}),t.forEach(function(t){createTripCard(t,e,n)})})["catch"](function(t){displayMessage("Uh oh!  We were unable to retreive your trip from the api.  If you previously searched with us, here is your latest search results.",null,"dismiss",Controller.showSavedSearch()),$("#load").css({display:"none"})})}function openDatabase(){return navigator.serviceWorker?idb.open("mtba-trans",1,function(t){t.createObjectStore("trips",{keyPath:"trip_id"})}):(displayMessage("WARNING: your web browser doesn't fully support this app",null,"dismiss"),Promise.resolve())}function IndexController(){this.db=openDatabase(),this.registerServiceWorker(),this.showSavedSearch()}var apikey="wX9NwuHnZU2ToO7GmGR9uw";IndexController.prototype.registerServiceWorker=function(){if(!("serviceWorker"in navigator))return void displayMessage("WARNING: your web browser doesn't fully support this app.  Try this app in chrome.",null,"dismiss");navigator.serviceWorker.register("./service-worker.js",{scope:"./"}).then(function(t){return t.waiting?void displayMessage("New update available!","Refresh","dismiss",function(t){t.postMessage({action:"skipWaiting"})},t.waiting):t.installing?void Controller.trackInstalling(t.installing):void t.addEventListener("updatefound",function(){Controller.trackInstalling(t.installing)})})["catch"](function(t){console.log("Service Worker Failed to Register",t)});var t;navigator.serviceWorker.addEventListener("controllerchange",function(){t||(window.location.reload(),t=!0)})},IndexController.prototype.trackInstalling=function(t){t.addEventListener("statechange",function(){"installed"==t.state&&displayMessage("New Update available!","update now!","dismiss",function(t){t.postMessage({action:"skipWaiting"})},t)})},IndexController.prototype.showSavedSearch=function(){this.db.then(function(t){if(!t)return void console.log("No database!");var e=t.transaction("trips","readwrite"),n=e.objectStore("trips");return n.getAll()}).then(function(t){if(0===t.length)return Promise.reject();var e="<div class='card-title'>Trip info for <b>"+t[0].route_id+"</b><br /><b>"+t[0].trip_start+"</b> to <b>"+t[0].trip_end+"</b></div>";t.forEach(function(t){e+=t.tripCard}),$("#trip-options").html(e)})};var Controller=new IndexController;$(document).ready(function(){getJSON("./assets/data/routes.json").then(function(t){var e="";return t.mode.forEach(function(t){e+="<option disabled>--"+t.mode_name+"--</option>",t.route.forEach(function(t){e+="<option value='"+t.route_id+"'>"+t.route_name+"</option>"})}),e}).then(function(t){$("#train-line").html(t)})["catch"](function(t){console.log(t)}),$("#train-line").change(function(){$("#trip-options").html(" "),getJSON("./assets/data/"+this.value+".json").then(function(t){var e="<option value='none' selected>--</option>";return t.direction[0].stop.forEach(function(t){e+="<option value='"+t.stop_id+"'>"+t.stop_name+"</option>"}),e}).then(function(t){$("#departing-stop").html(t),$("#destination-stop").html(t),$("#station-selection").removeClass("hidden")})["catch"](function(t){console.log(t)})}),$("#destination-stop").change(function(){"none"!=this.value&&"none"!=$("#departing-stop").value?$("#findTrain").prop("disabled",!1):$("#findTrain").prop("disabled",!0)}),$("#departing-stop").change(function(){"none"!=this.value&&"none"!=$("#destination-stop").value?$("#findTrain").prop("disabled",!1):$("#findTrain").prop("disabled",!0)}),$("#findTrain").click(function(t){var e,n=$("#train-line").val(),i=$("#departing-stop").val(),o=$("#destination-stop").val();return $("#departing-stop").prop("selectedIndex")==$("#destination-stop").prop("selectedIndex")?void displayMessage("Are you trying to trick me?  Departing stop and returning stop must be different",null,"dismiss"):(e=$("#departing-stop").prop("selectedIndex")<$("#destination-stop").prop("selectedIndex")?0:1,$("#load").css({display:"block"}),$("#trip-options").html(""),void getTrips(n,i,o,e))})});