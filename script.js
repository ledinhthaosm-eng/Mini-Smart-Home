
let states={}

// ===== Kết nối MQTT =====
const client = mqtt.connect(
"wss://4ac7c879e05a441da036dc91a453618c.s1.eu.hivemq.cloud:8884/mqtt",
{
 username:"Mini_Smart_Home",
 password:"Thaosm123"
});


// ===== Subscribe trạng thái =====
client.on("connect",function(){
  console.log("Connected MQTT");
  client.subscribe("home/living/light/state");
  client.subscribe("home/bed/light/state");
  client.subscribe("home/kitchen/light/state");
  client.subscribe("home/living/temp");
  client.subscribe("home/living/humi");

});


// ===== Nhận dữ liệu từ ESP32
client.on("message",function(topic,message){
  let msg = message.toString();

  if(topic=="home/living/light/state"){
    states["living_light"] = msg=="ON";   // cập nhật state để có thể đổi trạng thái 
    updateUI("living_light", msg=="ON");  // trong hàm click button
  }

  if(topic=="home/bed/light/state"){
    states["bed_light"] = msg=="ON";
    updateUI("bed_light", msg=="ON")
  }

  if(topic=="home/kitchen/light/state"){
    states["kitchen_light"] = msg=="ON";
    updateUI("kitchen_light", msg=="ON")
  }

  if(topic=="home/living/temp"){
    document.getElementById("living_temp").innerText=msg+" °C"
    addTemp(msg)
  }

  if(topic=="home/living/humi"){
    document.getElementById("living_humi").innerText=msg+" °C"
    addTemp(msg)
  }

});


// ===== CẬP NHẬT GIAO DIỆN =====
function updateUI(device,state){
  
  let text=document.getElementById("text_"+device)
  let btn=document.getElementById("btn_"+device)

  text.innerText=state?"ON":"OFF"
  btn.innerText = state?"TURN OFF" : "TURN ON";
  btn.className=state?"off":"on"
}

// ===== GỬI LỆNH ĐẾN ESP32 =====
function sendDevice(device, state){
  let msg = state ? "ON":"OFF";

  if(device=="living_light")
    client.publish("home/living/light/set",msg);

  if(device=="bed_light")
    client.publish("home/bed/light/set",msg);

  if(device=="kitchen_light")
    client.publish("home/kitchen/light/set",msg);
}

// ===== BUTTON CLICK =====
    let buttons = document.querySelectorAll(".device-btn");
    buttons.forEach(function(btn){
      btn.onclick = function(){

        let device = btn.dataset.device;
        let currentState = states[device];
	let newState = !currentState;
       
        sendDevice(device, newState);
        console.log(device, newState); // Debug
      };
    });

// CHART
let ctx=document.getElementById("tempChart")

let chart=new Chart(ctx,{
  type:"line",
  data:{
    labels:[],
    datasets:[{
      label:"Living Room Temperature",
      data:[],
      borderColor:"red",
      fill:false
    }]
  }
})

function addTemp(temp){

let time=new Date().toLocaleTimeString()

chart.data.labels.push(time)
chart.data.datasets[0].data.push(temp)

if(chart.data.labels.length>20){
  chart.data.labels.shift()
  chart.data.datasets[0].data.shift()
}
chart.update()

}

