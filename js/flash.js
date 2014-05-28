var RiseVision = RiseVision || {};
RiseVision.Flash = {};

RiseVision.Flash.Controller = (function(gadgets, swfobject) {
  "use strict";

  // constants
  var FLASH_CONTENT_ID = "flashContent";

  // private variables
  var _prefs = null, _url = "";

  // private functions
  function _checkSWFState(swf){
    if(swf.IsPlaying()){
      setTimeout(function(){
        _checkSWFState(swf);
      }, 1000);
    } else {
      if(swf.TotalFrames() <= 1){
        // The SWF was mistakenly set to be a Movie, it is an Application
      } else {
        // SWF Movie has played to its final frame
        _doneEvent();
      }
    }
  }

  function _checkSWFStatus(swf){
    if(swf.PercentLoaded() !== 100){
      // Keep polling SWF status to know when it has fully loaded
      setTimeout(function (){
        _checkSWFStatus(swf);
      }, 50);
    } else {
      // Only poll SWF state if user defined FileType as "Movie"
      if (_prefs.getString("fileType") === "movie") {
        setTimeout(function() {
          _checkSWFState(swf);
        }, 1000);
      }
    }
  }

  function _doneEvent() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));
  }

  function _embed(){
    var flashvars = {},
        params = {
          menu: "false",
          play: true,
          loop: false,
          wmode: "transparent",
          allowscriptaccess: "sameDomain",
          allownetworking: "internal"
        },
        attributes = {},
        c = document.getElementById(FLASH_CONTENT_ID), d;

    function onEmbed(e){
      if(e.success){
        //Ensure SWF is ready to be polled
        setTimeout(function checkSWFExistence(){
          if(typeof e.ref.PercentLoaded() !== "undefined"){
            _checkSWFStatus(e.ref);
          } else {
            checkSWFExistence();
          }
        }, 10);
      }
    }

    /* check if SWF has been removed, if this is the case, create a
     new flash/alternative content div
     */
    if (!c) {
      d = document.createElement("div");
      d.setAttribute("id", FLASH_CONTENT_ID);
      d.innerHTML = "<p data-i18n='no-flash'></p>";
      document.getElementById("flashContainer").appendChild(d);
    }

    swfobject.embedSWF(_url, FLASH_CONTENT_ID, _prefs.getInt("rsW"),
      _prefs.getInt("rsH"), "9.0.280","expressInstall.swf", flashvars,
      params, attributes, onEmbed);
  }

  function _onAdditionalParams(name, value){
    if (name == "additionalParams") {
      if (value) {
        value = JSON.parse(value);

        // Configure the value for _url
        _url = value["url"];

        // Add http:// if no protocol parameter exists
        if (_url.indexOf("://") == -1) {
          _url = "http://" + _url;
        }
      }
    }

    _readyEvent();
  }

  function _onPause(){
    swfobject.removeSWF(FLASH_CONTENT_ID);
  }

  function _onPlay(){
    _embed();
  }

  function _onStop(){
    swfobject.removeSWF(FLASH_CONTENT_ID);
  }

  function _readyEvent(){
    /* Send the ready event to the player */
    gadgets.rpc.call('', 'rsevent_ready', null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  // public space
  return {
    init: function(){
      _prefs = new gadgets.Prefs();

      var id = _prefs.getString("id"),
        backgroundColor = _prefs.getString("backgroundColor");

      // Set background colour
      if (backgroundColor != "") {
        document.body.style.background = backgroundColor;
      }

      if (id) {
        // Register rpc event handlers
        gadgets.rpc.register("rscmd_play_" + id, _onPlay);
        gadgets.rpc.register("rscmd_pause_" + id, _onPause);
        gadgets.rpc.register("rscmd_stop_" + id, _onStop);

        // Retrieve additional params
        gadgets.rpc.register("rsparam_set_" + id, _onAdditionalParams);
        gadgets.rpc.call("", "rsparam_get", null, id, "additionalParams");
      }

    }
  }

})(gadgets,swfobject);

//Add Analytics code.
var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-41395348-15']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Disable context menu (right click menu)
window.oncontextmenu = function() {
  return false;
};

// Initialize Web Page Controller
RiseVision.Flash.Controller.init();