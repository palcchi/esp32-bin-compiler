#include <WiFi.h>
#include <WebServer.h>
#include <Update.h>
#include <Wire.h>
#define OLED_ADDR 0x3C
#define SDA_PIN 21
#define SCL_PIN 22
const char* ssid="VALLIAN-ESP32"; const char* password="12345678";
WebServer server(80); uint8_t fb[1024];
struct Glyph{char c;uint8_t d[5];};
const Glyph font[]={{' ',{0,0,0,0,0}},{'!',{0,0,0x5F,0,0}},{'\'',{0,7,0,0,0}},{',',{0,0x50,0x30,0,0}},{'?',{2,1,0x51,9,6}},{'A',{0x7E,0x11,0x11,0x11,0x7E}},{'C',{0x3E,0x41,0x41,0x41,0x22}},{'I',{0,0x41,0x7F,0x41,0}},{'T',{1,1,0x7F,1,1}},{'W',{0x7F,0x20,0x18,0x20,0x7F}},{'a',{0x20,0x54,0x54,0x54,0x78}},{'b',{0x7F,0x48,0x44,0x44,0x38}},{'c',{0x38,0x44,0x44,0x44,0x20}},{'e',{0x38,0x54,0x54,0x54,0x18}},{'f',{8,0x7E,9,1,2}},{'g',{0x0C,0x52,0x52,0x52,0x3E}},{'h',{0x7F,8,4,4,0x78}},{'i',{0,0x44,0x7D,0x40,0}},{'k',{0x7F,0x10,0x28,0x44,0}},{'l',{0,0x41,0x7F,0x40,0}},{'m',{0x7C,4,0x18,4,0x78}},{'n',{0x7C,8,4,4,0x78}},{'o',{0x38,0x44,0x44,0x44,0x38}},{'r',{0x7C,8,4,4,8}},{'s',{0x48,0x54,0x54,0x54,0x20}},{'t',{4,0x3F,0x44,0x40,0x20}},{'u',{0x3C,0x40,0x40,0x20,0x7C}},{'v',{0x1C,0x20,0x40,0x20,0x1C}},{'y',{0x0C,0x50,0x50,0x50,0x3C}}};
const uint8_t* glyph(char c){for(auto &g:font)if(g.c==c)return g.d;static uint8_t blank[5]={0};return blank;}
void cmd(uint8_t c){Wire.beginTransmission(OLED_ADDR);Wire.write(0);Wire.write(c);Wire.endTransmission();}
void oledInit(){Wire.begin(SDA_PIN,SCL_PIN);delay(100);const uint8_t init[]={0xAE,0x20,0x00,0xB0,0xC8,0x00,0x10,0x40,0x81,0xCF,0xA1,0xA6,0xA8,0x3F,0xA4,0xD3,0,0xD5,0x80,0xD9,0xF1,0xDA,0x12,0xDB,0x40,0x8D,0x14,0xAF};for(uint8_t c:init)cmd(c);}
void clearFB(){memset(fb,0,sizeof(fb));} void pixel(int x,int y,bool on=true){if(x<0||x>=128||y<0||y>=64)return;if(on)fb[x+(y/8)*128]|=(1<<(y&7));}
void drawChar(int x,int y,char c,int scale=1){const uint8_t*d=glyph(c);for(int col=0;col<5;col++)for(int row=0;row<7;row++)if(d[col]&(1<<row))for(int dx=0;dx<scale;dx++)for(int dy=0;dy<scale;dy++)pixel(x+col*scale+dx,y+row*scale+dy);}
int textWidth(const char*s,int scale=1){return strlen(s)*6*scale-1;} void centered(const char*s,int y,int scale=1){int x=(128-textWidth(s,scale))/2;for(;*s;s++,x+=6*scale)drawChar(x,y,*s,scale);}
void showFB(){cmd(0x21);cmd(0);cmd(127);cmd(0x22);cmd(0);cmd(7);for(int i=0;i<1024;i+=16){Wire.beginTransmission(OLED_ADDR);Wire.write(0x40);for(int j=0;j<16;j++)Wire.write(fb[i+j]);Wire.endTransmission();}}
void page(const char*a,const char*b){clearFB();centered(a,20);centered(b,36);showFB();}
const char updatePage[]=R"rawliteral(<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><body><h2>VALLIAN ESP32</h2><form method="POST" action="/update" enctype="multipart/form-data"><input type="file" name="firmware" accept=".bin" required><button>Install Firmware</button></form></body></html>)rawliteral";
void setupOTA(){WiFi.mode(WIFI_AP);WiFi.softAP(ssid,password);server.on("/",HTTP_GET,[](){server.send(200,"text/html",updatePage);});server.on("/update",HTTP_POST,[](){if(Update.hasError())server.send(500,"text/plain","UPDATE FAILED");else{server.send(200,"text/plain","UPDATE SUCCESS - RESTARTING");delay(700);ESP.restart();}},[](){HTTPUpload&u=server.upload();if(u.status==UPLOAD_FILE_START)Update.begin(UPDATE_SIZE_UNKNOWN);else if(u.status==UPLOAD_FILE_WRITE)Update.write(u.buf,u.currentSize);else if(u.status==UPLOAD_FILE_END)Update.end(true);});server.begin();}
struct LyricCue{const char*a;const char*b;uint32_t duration;};
LyricCue lyrics[]={{"It's stress relief","from everything",4300},{"Tell me","",2100},{"tell me","you love me",1300},{"Come back","",2600},{"come back","to haunt me",4250},{"Won't you","",1600},{"won't you","let me",2500},{"be","",1000},{"myself?","",2500},{"","",800}};
const int LYRIC_COUNT=sizeof(lyrics)/sizeof(lyrics[0]);int lyricIndex=0;uint32_t lastChange=0;void showLyric(int i){page(lyrics[i].a,lyrics[i].b);}
void setup(){Serial.begin(115200);oledInit();clearFB();centered("VALLIAN",28);showFB();setupOTA();delay(1200);showLyric(0);lastChange=millis();}
void loop(){server.handleClient();if(millis()-lastChange>=lyrics[lyricIndex].duration){lyricIndex=(lyricIndex+1)%LYRIC_COUNT;showLyric(lyricIndex);lastChange=millis();}delay(2);}
