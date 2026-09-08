#include <WiFi.h>
#include <WebServer.h>
#include <Update.h>
#include <Wire.h>
#include "LyricsFrames.h"

#define OLED_ADDR 0x3C
#define SDA_PIN 21
#define SCL_PIN 22

const char* ssid = "VALLIAN-ESP32";
const char* password = "12345678";
WebServer server(80);

void cmd(uint8_t c){
  Wire.beginTransmission(OLED_ADDR);
  Wire.write(0x00);
  Wire.write(c);
  Wire.endTransmission();
}

void oledInit(){
  Wire.begin(SDA_PIN,SCL_PIN);
  Wire.setClock(400000);
  delay(80);
  const uint8_t init[]={0xAE,0x20,0x00,0xB0,0xC8,0x00,0x10,0x40,0x81,0xCF,0xA1,0xA6,0xA8,0x3F,0xA4,0xD3,0x00,0xD5,0x80,0xD9,0xF1,0xDA,0x12,0xDB,0x40,0x8D,0x14,0xAF};
  for(uint8_t c:init) cmd(c);
}

void showFrame(uint16_t index){
  if(index >= LYRIC_FRAME_COUNT) return;
  cmd(0x21); cmd(0); cmd(127);
  cmd(0x22); cmd(0); cmd(7);
  const uint8_t* frame = lyric_frames[index];
  for(int i=0;i<1024;i+=16){
    Wire.beginTransmission(OLED_ADDR);
    Wire.write(0x40);
    for(int j=0;j<16;j++) Wire.write(pgm_read_byte(frame+i+j));
    Wire.endTransmission();
  }
}

const char updatePage[] = R"rawliteral(
<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system;background:#0b0d10;color:#fff;padding:24px}form{max-width:420px;padding:20px;border:1px solid #333;border-radius:16px}button,input{width:100%;box-sizing:border-box;margin-top:12px;padding:12px}</style>
<body><h2>VALLIAN ESP32</h2><p>OLED Lyrics OTA</p><form method="POST" action="/update" enctype="multipart/form-data"><input type="file" name="firmware" accept=".bin" required><button>Install Firmware</button></form></body></html>
)rawliteral";

void setupOTA(){
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid,password);
  server.on("/",HTTP_GET,[](){ server.send(200,"text/html",updatePage); });
  server.on("/update",HTTP_POST,[](){
    if(Update.hasError()) server.send(500,"text/plain","UPDATE FAILED");
    else { server.send(200,"text/plain","UPDATE SUCCESS - RESTARTING"); delay(700); ESP.restart(); }
  },[](){
    HTTPUpload& u=server.upload();
    if(u.status==UPLOAD_FILE_START) Update.begin(UPDATE_SIZE_UNKNOWN);
    else if(u.status==UPLOAD_FILE_WRITE) Update.write(u.buf,u.currentSize);
    else if(u.status==UPLOAD_FILE_END) Update.end(true);
  });
  server.begin();
}

uint16_t lyricIndex=0;
uint32_t lastChange=0;

void setup(){
  Serial.begin(115200);
  oledInit();
  setupOTA();
  showFrame(0);
  lastChange=millis();
}

void loop(){
  server.handleClient();
  if(LYRIC_FRAME_COUNT && millis()-lastChange >= lyric_durations[lyricIndex]){
    lyricIndex=(lyricIndex+1)%LYRIC_FRAME_COUNT;
    showFrame(lyricIndex);
    lastChange=millis();
  }
  delay(2);
}
