# Soundboard
by ltGuillaume: [Codeberg](https://codeberg.org/ltGuillaume) | [GitHub](https://github.com/ltGuillaume) | [Buy me a beer](https://buymeacoff.ee/ltGuillaume) 🍺

_Soundboard is a simple mobile web-based soundboard system with the ability to record your own sounds and play them on a remote (party) computer._

#### Included
- Soundboard web system (can be used as stand-alone system)
- Party client for Windows ([AutoIt](http://www.autoitscript.com/autoit3/) script + executable)
- Party client via local HTTP server
- Soundboard+[Festify](http://getfestify.com) Wrapper, in order to let people add to the party playlist of the party PC, while recording and playing soundboard items over that music

#### Requirements
1. Web hosting with PHP (local or remote host)  
_For central use on parties (optional):_
2. A Windows (party) PC for playback via the Windows client  
_-- or --_  
A Windows/Linux (party) PC with web server, accessible by the Soundboard web system on (1)  
_For Soundboard+Festify Wrapper (optional):_
4. A (party) PC running [Festify](http://getfestify.com)

#### Dependencies
- Both clients are made to use [MPV](http://mpv.io/), an MPlayer fork.
- The Windows client is made with [AutoIt](http://www.autoitscript.com/autoit3/).
- The optional Soundboard+Festify Wrapper wraps around the nicely done party playlist system [Festify](http://getfestify.com), for which in turn you'll need a [Spotify Premium](http://spotify.com) account.

#### Screenshots
###### Soundboard:  
![Soundboard](SOUNDBOARD.png)  
###### Soundboard+Festify Wrapper:  
![Soundboard+Festify Wrapper](WRAPPER.png)  
###### (on small screens, you can drag left/right between Soundboard and Festify playlist)
