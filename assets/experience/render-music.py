"""Original eight-bar theme, 64 BPM, ten sample-aligned 30-second arrangements.
Python + NumPy; outputs seamless 22.05 kHz mono PCM loops. No external samples.
"""
from pathlib import Path
import numpy as np
import wave
SR=22050; BPM=64; beat=60/BPM; duration=32*beat; N=round(duration*SR)
out=Path(__file__).parent/'music';out.mkdir(exist_ok=True)
def freq(m):return 440*2**((m-69)/12)
def note(dst,m,start,length,amp,bright=0):
 n=round(length*SR);t=np.arange(n)/SR;f=freq(m)
 env=np.minimum(1,t/.025)*np.minimum(1,(length-t)/.15)
 sig=np.sin(2*np.pi*f*t)+bright*.3*np.sin(2*np.pi*2*f*t)+bright*.12*np.sin(2*np.pi*3*f*t)
 idx=(round(start*SR)+np.arange(n))%N;np.add.at(dst,idx,amp*env*sig)
chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[55,62,67,71]]*2
melody=[72,76,79,76,71,74,76,74,69,72,77,76,71,74,79,74]*2
for level in range(1,11):
 x=np.zeros(N)
 for bar,chord in enumerate(chords):
  for m in chord:note(x,m,bar*4*beat,4*beat,.035,level/20)
 for k,m in enumerate(melody):
  if level>=3 or k%2==0:note(x,m,k*beat,.8*beat,.04,level/14)
 if level>=2:
  for b in range(0,32,4):note(x,84+(b//4)%3,b*beat,1.5*beat,.015)
 if level>=3:
  for k in range(64):note(x,chords[k//8][k%4]+12,k*beat/2,beat*.4,.012+level*.001,level/10)
 if level>=4:
  for b in range(32):note(x,chords[b//4][0]-12,b*beat,.8*beat,.035)
 if level>=5:
  for b in range(32):
   n=round(.22*SR);t=np.arange(n)/SR;phase=2*np.pi*(48*t+55*.035*(1-np.exp(-t/.035)));sig=np.sin(phase)*np.exp(-t*22)*(.018+level*.003);idx=(round(b*beat*SR)+np.arange(n))%N;np.add.at(x,idx,sig)
 if level>=6:
  rng=np.random.default_rng(32)
  for k in range(64 if level<9 else 128):
   n=round(.065*SR);noise=rng.normal(0,1,n);noise=np.concatenate([[0],np.diff(noise)]);sig=noise*np.exp(-np.arange(n)/SR*90)*(.003+level*.0005);idx=(round(k*duration/(64 if level<9 else 128)*SR)+np.arange(n))%N;np.add.at(x,idx,sig)
 if level>=7:
  for b in range(1,32,2):note(x,50,b*beat,.1,.025,1)
 if level>=8:
  for k,m in enumerate(melody):note(x,m+12,k*beat,.55*beat,.016,1)
 if level>=9:
  for k in range(128):note(x,chords[k//16][k%4]+24,k*beat/4,beat*.18,.012,1)
 if level>=10:
  for b in range(0,32,4):note(x,melody[b]+12,b*beat,2*beat,.022,1)
 # Equal loudness: arrangement grows without a volume jump. Conservative headroom.
 x*=.13/max(np.sqrt(np.mean(x*x)),1e-6);x=np.tanh(x);pcm=np.int16(x*32767)
 with wave.open(str(out/f'level-{level}.wav'),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
 print(f'Level {level}: {duration:.0f}s, peak {np.max(np.abs(x)):.3f}')
