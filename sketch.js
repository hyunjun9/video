let writerState = 0; // 0초기상태 1녹화중 2일시정지 3종료 및 저장
let startTime = 0;
let pausedStartTime = 0; //일시정지 누른 시각
let recordingSecond = 0;
let totalRecordingTime = 0;
let recordingTime = 0;

let rearSetting;
let camera;
let detector;

let myVideoRec;

let passenger = 0;

let dataMsg = '';
let myWriter;

let y,m,d,h,mi;

function preload(){
  detector = ml5.objectDetector('cocossd');
}

function setup() {
  createCanvas(667,375);
  rearSetting = {
    audio: false,
    video: {
      facingMode: {
        exact : "environment" // rear camera
      }
    }
  }
  camera = createCapture(VIDEO);
  camera.hide();
 
  myVideoRec = new P5MovRec();

}

function draw() {
  background(100);
 
  image(camera,0,0,567,375);
 
  fill(0);
  noStroke();
  rect(567,0,100,375);
 
  stroke(250);
  strokeWeight(5);
  ellipse(617,102,44,44);
  ellipse(617,187,44,44);
  ellipse(617,272,44,44);
 
  noFill();
  stroke(250);
  strokeWeight(1);
  ellipse(20,50,8,8);
 
  // 일시정지 버튼 생성
  fill(250);
  noStroke();
  rect(610,92,5,20);
  rect(620,92,5,20);
 
  // 종료 및 저장 버튼 생성
  rect(609,264,16,16);
 
  fill(196,196,196,50);
  noStroke();
  rect(10,10,84,20,6,6,6,6);
  rect(105,10,44,20,6,6,6,6);
  rect(10,40,84,20,6,6,6,6);
  rect(456,10,100,20,6,6,6,6);
 
  // 년월일
  fill(0);
  y = year();
  text('\n'+y+'.',20,10);

  m = nf(month(),2,0);
  text('\n'+m+'.',50,10);
 
  d = nf(day(),2,0);
  text('\n'+d,67,10);
 
  h = nf(hour(),2,0);
  text('\n'+h+' '+':',110,10);
 
  mi = nf(minute(),2,0);
  text('\n'+mi,132,10);
 
  // passenger
  noStroke();
  text('passengers'+ ' '+ passenger,470,24);
 
  if(writerState == 0){
    //녹화 버튼 생성
    fill(250,0,0);
    noStroke();
    ellipse(617,187,28,28);
 
  }else if(writerState == 1){ // 녹화
    detector.detect(camera, gotDetections);
    recordingSecond = millis()- startTime + totalRecordingTime;
    makeTime();
   
    text(recordingTime, 30 ,55);
    fill(250,0,0);
    noStroke();
    ellipse(20,50,9,9);
   
    // 녹화중일 때 녹화버튼 변경
    fill(250,0,0);
    noStroke();
    rect(609,179,16,16);
   
  } else if(writerState == 2){ //일시정지
    recordingSecond = pausedStartTime - startTime + totalRecordingTime;
    makeTime();
   
    text(recordingTime, 30 ,55);
    noFill();
    stroke(250);
    strokeWeight(1);
    ellipse(20,50,8,8);
   
    stroke(250,0,0);
    strokeWeight(5);
    ellipse(617,102,44,44);
   
    //녹화 버튼 생성
    fill(250,0,0);
    noStroke();
    ellipse(617,187,28,28);
   
  } else if(writerState == 3){ // 종료 및 저장
    makeTime();
   
    text(recordingTime, 30 ,55);
    passenger = 0;
    noFill();
    stroke(250);
    strokeWeight(1);
    ellipse(20,50,8,8);
   
    //녹화 버튼 생성
    fill(250,0,0);
    noStroke();
    ellipse(617,187,28,28);
  }
 
}

function makeTime(){
  //recording 시간 HH:MM:SS 형식으로 만들어줌
  let recordHour = Math.floor(recordingSecond/(1000*60*60));
  let recordMin = Math.floor(recordingSecond/(1000*60))%60;
  let recordSec = Math.floor(recordingSecond/1000)%60;
 
  recordingTime = nf(recordHour,2,0) + ":" + nf(recordMin,2,0) + ":"
                  + nf(recordSec,2,0);
}

function mouseClicked(){
  if(dist(mouseX, mouseY, 617,187) <= 35){ //녹화시작버튼
    if(writerState != 1){
      if(writerState == 2){
        totalRecordingTime += pausedStartTime - startTime;
      }
     
     
      if(writerState == 0 || writerState == 3){
        // 동영상 녹화 시작
        myVideoRec.startRec();
       
        // 파일 생성
        let fileName = 'data_' + y + m + d + '.txt';
        myWriter = createWriter(fileName);
      }
      writerState = 1;
      startTime = millis();
    }
  } else if(dist(mouseX, mouseY,610,92) <= 35){ //일시정지버튼
    if(writerState == 1){
      writerState = 2;
      pausedStartTime = millis();
    }
  } else if(dist(mouseX, mouseY,609,264) <= 35){ // 종료 및 저장버튼
    if(writerState == 1 || writerState == 2){
      writerState = 3;
      recordingSecond = 0;
      pausedStartTime = 0;
      totalRecordingTime = 0;
      startTime = 0;
     
      myVideoRec.stopRec();
     
      myWriter.print(dataMsg);
      myWriter.close();
      myWriter.clear();
     
      dataMsg = '';
    }
  }
}

function gotDetections(error, results){
  if(error){
    console.error(error)
  }
 
  passenger = 0;
  for(let i=0; i<results.length; i++){
    let object = results[i];
   
    if(object.label == 'person'){
      passenger = passenger + 1;
     
      stroke(0, 255, 0);
      strokeWeight(4);
      noFill();
      rect(object.x, object.y, object.width, object.height);
     
      noStroke();
      fill(0,255,0);
      //textSize(24);
      text(object.label, object.x+10, object.y+24);
     
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(12);
      stroke(0,255,0);
      point(centerX, centerY);      
     
      dataMsg += recordingTime + ',' + passenger + ',' +
                centerX + ',' + centerY+'\n';
     
    }
  }
}