var RiseVision = RiseVision || {};
RiseVision.Flash = {};

RiseVision.Flash.Controller = (function(gadgets) {
  "use strict";

  // private variables
  var _prefs = null, _url = "", _intervalID = null, _el;

  // private functions
  function _cache(){
    _el = {
      flashCtn:   document.getElementById("flashContent")
    }
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
        attributes = {};

    function onEmbed(e){
      if(e.success){
        //TODO: configure an interval check based on type of Flash SWF
      }
    }

    swfobject.embedSWF(_url, "flashContent", _prefs.getInt("rsW"),
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

  }

  function _onPlay(){
    _embed();
  }

  function _onStop(){

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

      _cache();

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

})(gadgets);

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