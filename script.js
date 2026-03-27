
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
  client.subscribe("home/living/fan/state");
  client.subscribe("home/bed/light/state");
  client.subscribe("home/kitchen/light/state");
  client.subscribe("home/living/temperature");
  client.subscribe("home/living/humidity");
  client.subscribe("home/door/state");

});


// ===== Nhận dữ liệu từ ESP32
client.on("message",function(topic,message){
  let msg = message.toString();

  if(topic=="home/living/light/state"){
    states["living_light"] = msg=="ON";   // cập nhật state để có thể đổi trạng thái 
    updateUI("living_light", msg=="ON");  // trong hàm click button
  }

  if(topic=="home/living/fan/state"){
    states["living_fan"] = msg=="ON";    
    updateUI("living_fan", msg=="OFF");  
  }


  if(topic=="home/bed/light/state"){
    states["bed_light"] = msg=="ON";
    updateUI("bed_light", msg=="ON")
  }

  if(topic=="home/kitchen/light/state"){
    states["kitchen_light"] = msg=="ON";
    updateUI("kitchen_light", msg=="ON")
  }

  if(topic=="home/living/temperature"){
    document.getElementById("living_temp").innerText=msg+" °C"

    updateTemperature(parseFloat(msg))
  }

  if(topic=="home/living/humidity"){
    document.getElementById("living_humi").innerText=msg+" %"

    updateHumidity(parseFloat(msg))
  }

  if(topic=="home/door/state"){
  let door = document.getElementById("door");

  if(msg=="OPEN"){
    door.classList.add("open");
    door.classList.remove("close");
  }

  if(msg=="CLOSE"){
    door.classList.add("close");
    door.classList.remove("open");
  }

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

  if(device=="living_fan")
    client.publish("home/living/fan/set",msg);

  if(device=="bed_light")
    client.publish("home/bed/light/set",msg);

  if(device=="kitchen_light")
    client.publish("home/kitchen/light/set",msg);
}

window.onload = function(){
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
}

// Hàm cập nhật dữ liệu nhiệt độ - độ ẩm
function updateTemperature(temp){

  let el = document.getElementById("tempValue");
  if(!el) return;

  el.innerText = temp + " °C";
}

function updateHumidity(humi){
  let el = document.getElementById("humiValue");
  if(!el) return;

  el.innerText = humi+" %";
}


// Cập nhật thời gian - realtime
  function updateDateTime(){
    let now = new Date();

    let h = now.getHours().toString().padStart(2,'0');
    let m = now.getMinutes().toString().padStart(2,'0');
    let s = now.getSeconds().toString().padStart(2,'0');

    let day = now.getDate().toString().padStart(2,'0');
    let month = (now.getMonth()+1).toString().padStart(2,'0');
    let year = now.getFullYear();

    document.getElementById("clock").innerHTML = h + ":" + m + ":" + s;
    document.getElementById("date").innerHTML = day + "/" + month + "/" + year;
  }

  setInterval(updateDateTime,1000);
  updateDateTime();

// Hàm gửi lệnh mở cửa
function openDoor(){
  client.publish("home/door","OPEN");
}

// Hàm gửi lệnh đóng cửa
function closeDoor(){
  client.publish("home/door","CLOSE");
}

// ===== USER & PASSWORD =====
const USER = "admin";
const PASS = "123456";

// ===== LOGIN FUNCTION =====
function login(){
  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;

  if(u === USER && p === PASS){
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainPage").style.display = "block";

    // lưu trạng thái đăng nhập để cho phép AUTO LOGIN
    localStorage.setItem("login","true");
  }else{
    document.getElementById("error").innerText = "Sai tài khoản hoặc mật khẩu!";
  }
}

// ===== AUTO LOGIN =====
//window.onload = function(){
//  if(localStorage.getItem("login") === "true"){
//    document.getElementById("loginPage").style.display = "none";
//    document.getElementById("mainPage").style.display = "block";
//  }
//}

// ===== LOGOUT FUNCTION =====
function logout(){
  localStorage.removeItem("login");
  location.reload();
}

